import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, WebSocket } from 'ws';
import { IncomingMessage } from 'http';
import { Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { VoiceService } from './voice.service.js';

/* ──────────────────────────────────────────────────────────
 * Gateway
 *
 * Listens on a separate WebSocket path: /ws/voice
 * Mobile client connects here → backend proxies to Gemini Live.
 * ────────────────────────────────────────────────────────── */

@WebSocketGateway({
  path: '/ws/voice',
  cors: {
    origin: '*', // Locked down by Supabase JWT — no CORS needed
  },
})
export class VoiceGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(VoiceGateway.name);

  /** Maps each raw WS client to its session ID for fast lookup */
  private readonly sessionMap = new Map<WebSocket, string>();

  constructor(private readonly voiceService: VoiceService) {}

  /* ──────────────────────────────────────────────────────────
   * Connection
   * ────────────────────────────────────────────────────────── */

  async handleConnection(client: WebSocket, req: IncomingMessage): Promise<void> {
    // ── 1. Extract Bearer token from the query string ────────
    //    Mobile sends: wss://host/ws/voice?token=<supabase_jwt>
    const url = new URL(req.url ?? '', `http://${req.headers.host}`);
    const token = url.searchParams.get('token');

    if (!token) {
      this.logger.warn('Voice connection rejected: no token');
      client.close(4001, 'Unauthorized: missing token');
      return;
    }

    // ── 2. Validate Supabase JWT ─────────────────────────────
    const userId = await this.voiceService.verifyToken(token);
    if (!userId) {
      this.logger.warn('Voice connection rejected: invalid token');
      client.close(4001, 'Unauthorized: invalid token');
      return;
    }

    // ── 3. Assign a session ID and open the Gemini proxy ─────
    const sessionId = uuidv4();
    this.sessionMap.set(client, sessionId);

    this.logger.log(`[${sessionId}] Client connected (user: ${userId})`);

    // ── 4. Wire incoming client messages → Gemini ──────────
    client.on('message', (data) => {
      this.voiceService.forwardToGemini(sessionId, data.toString());
    });

    client.on('error', (err) => {
      this.logger.error(`[${sessionId}] Client WS error: ${err.message}`);
    });

    // ── 5. Open the Gemini session (connects to Gemini WSS) ──
    await this.voiceService.openSession(sessionId, userId, client);
  }

  /* ──────────────────────────────────────────────────────────
   * Disconnection
   * ────────────────────────────────────────────────────────── */

  handleDisconnect(client: WebSocket): void {
    const sessionId = this.sessionMap.get(client);
    if (!sessionId) return;

    this.logger.log(`[${sessionId}] Client disconnected`);
    this.voiceService.closeSession(sessionId);
    this.sessionMap.delete(client);
  }
}
