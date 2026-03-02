import {
  Injectable,
  Logger,
  OnModuleDestroy,
} from '@nestjs/common';
import WebSocket from 'ws';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

/* ──────────────────────────────────────────────────────────
 * Types
 * ────────────────────────────────────────────────────────── */

/**
 * One active voice session = one pair of WebSocket connections:
 *   clientWs  →  the mobile app connection
 *   geminiWs  →  the Gemini Live API connection
 */
interface VoiceSession {
  clientWs: WebSocket;
  geminiWs: WebSocket;
  userId: string;
  createdAt: Date;
}

/* ──────────────────────────────────────────────────────────
 * Constants
 * ────────────────────────────────────────────────────────── */

/**
 * Gemini Live API endpoint.
 * Uses the dedicated voice key — NEVER the chat key.
 */
const GEMINI_LIVE_URL = (apiKey: string) =>
  `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=${apiKey}`;

const GEMINI_MODEL = 'models/gemini-2.0-flash-live-001';

/** Maximum session duration: 14 minutes (Gemini hard limit is 15) */
const MAX_SESSION_MS = 14 * 60 * 1000;

/** Mental-wellness system prompt (same guard rails as chat) */
const VOICE_SYSTEM_INSTRUCTION = `You are Moody, an empathetic AI mental wellness voice companion.
Speak naturally and warmly like a caring friend. Keep responses short (1–3 sentences).
Focus only on emotional support, mood reflection, and simple coping strategies.
Never diagnose, never prescribe, and always encourage professional help for serious distress.
If the user goes off-topic, gently redirect them back to their wellbeing.`;

/* ──────────────────────────────────────────────────────────
 * Service
 * ────────────────────────────────────────────────────────── */

@Injectable()
export class VoiceService implements OnModuleDestroy {
  private readonly logger = new Logger(VoiceService.name);
  private readonly sessions = new Map<string, VoiceSession>();
  private readonly supabase: SupabaseClient;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase environment variables are not configured');
    }
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  /* ──────────────────────────────────────────────────────────
   * Auth
   * ────────────────────────────────────────────────────────── */

  /**
   * Validates a Supabase JWT and returns the user id.
   * Called during the WebSocket handshake before any audio flows.
   */
  async verifyToken(token: string): Promise<string | null> {
    try {
      const { data: { user }, error } = await this.supabase.auth.getUser(token);
      if (error || !user) return null;
      return user.id;
    } catch {
      return null;
    }
  }

  /* ──────────────────────────────────────────────────────────
   * Session lifecycle
   * ────────────────────────────────────────────────────────── */

  /**
   * Opens a Gemini Live WebSocket and wires it to the client WebSocket.
   * Audio chunks flow: client → Gemini (user speech)
   *                    Gemini → client (AI speech)
   */
  async openSession(sessionId: string, userId: string, clientWs: WebSocket): Promise<void> {
    const apiKey = process.env.GEMINI_API_KEY_VOICE;
    if (!apiKey) {
      this.sendError(clientWs, 'Voice service is not configured.');
      return;
    }

    const geminiWs = new WebSocket(GEMINI_LIVE_URL(apiKey));

    const session: VoiceSession = {
      clientWs,
      geminiWs,
      userId,
      createdAt: new Date(),
    };

    this.sessions.set(sessionId, session);
    this.logger.log(`[${sessionId}] Opening session for user ${userId}`);

    // ── Gemini connection events ─────────────────────────────

    geminiWs.on('open', () => {
      this.logger.log(`[${sessionId}] Gemini WS connected`);

      // Send the Setup message immediately after the connection opens
      const setupMessage = {
        setup: {
          model: GEMINI_MODEL,
          generation_config: {
            response_modalities: ['AUDIO'],
            speech_config: {
              voice_config: {
                prebuilt_voice_config: {
                  voice_name: 'Aoede', // Warm, natural female voice
                },
              },
            },
          },
          system_instruction: {
            parts: [{ text: VOICE_SYSTEM_INSTRUCTION }],
          },
        },
      };

      geminiWs.send(JSON.stringify(setupMessage));
    });

    geminiWs.on('message', (data: WebSocket.RawData) => {
      // Relay Gemini's response chunks to the client
      if (clientWs.readyState === WebSocket.OPEN) {
        clientWs.send(data);
      }
    });

    geminiWs.on('error', (err) => {
      this.logger.error(`[${sessionId}] Gemini WS error: ${err.message}`);
      this.sendError(clientWs, 'AI service error. Please try again.');
      this.closeSession(sessionId);
    });

    geminiWs.on('close', (code, reason) => {
      this.logger.log(`[${sessionId}] Gemini WS closed (${code}): ${reason}`);
      if (clientWs.readyState === WebSocket.OPEN) {
        clientWs.close(1000, 'AI session ended');
      }
      this.sessions.delete(sessionId);
    });

    // ── Auto-expire after max session duration ───────────────
    setTimeout(() => {
      if (this.sessions.has(sessionId)) {
        this.logger.log(`[${sessionId}] Session max duration reached — closing`);
        this.closeSession(sessionId);
      }
    }, MAX_SESSION_MS);
  }

  /**
   * Forwards a raw audio chunk (base64 encoded PCM) from the client to Gemini.
   * The chunk must already be structured as a BidiGenerateContentClientContent message.
   */
  forwardToGemini(sessionId: string, message: string): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    const { geminiWs } = session;
    if (geminiWs.readyState === WebSocket.OPEN) {
      geminiWs.send(message);
    }
  }

  /**
   * Gracefully closes both WebSocket connections for a session.
   */
  closeSession(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    this.logger.log(`[${sessionId}] Closing session`);

    if (session.geminiWs.readyState === WebSocket.OPEN) {
      session.geminiWs.close(1000, 'Session ended by client');
    }
    if (session.clientWs.readyState === WebSocket.OPEN) {
      session.clientWs.close(1000, 'Session ended');
    }

    this.sessions.delete(sessionId);
  }

  /* ──────────────────────────────────────────────────────────
   * Graceful shutdown
   * ────────────────────────────────────────────────────────── */

  onModuleDestroy() {
    for (const [sessionId] of this.sessions) {
      this.closeSession(sessionId);
    }
  }

  /* ──────────────────────────────────────────────────────────
   * Helpers
   * ────────────────────────────────────────────────────────── */

  private sendError(ws: WebSocket, message: string): void {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'error', message }));
    }
  }
}
