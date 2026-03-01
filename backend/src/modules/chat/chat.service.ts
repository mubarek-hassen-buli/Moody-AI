import { Inject, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { eq, desc } from 'drizzle-orm';
import type { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from '@google/generative-ai';
import { DRIZZLE } from '../../core/database/database.module.js';
import { chatMessages, users } from '../../core/database/schema.js';
import type * as schema from '../../core/database/schema.js';

/* ──────────────────────────────────────────────────────────
 * Constants
 * ────────────────────────────────────────────────────────── */

/** Number of past messages fed to Gemini as conversation context */
const HISTORY_CONTEXT_LIMIT = 20;

/** Number of messages returned to the client for the chat screen */
const HISTORY_FETCH_LIMIT = 50;

/**
 * System instruction that keeps Gemini focused on mental-wellness support.
 * This is injected server-side only — never exposed to the client.
 */
const SYSTEM_INSTRUCTION = `You are Moody, a compassionate and empathetic AI mental wellness companion built into the Moody-AI app.

Your role:
- Provide warm, supportive, and non-judgmental emotional support
- Help users reflect on their feelings and emotions
- Suggest simple, evidence-based coping strategies (breathing exercises, mindfulness, journaling)
- Celebrate positive moments and progress with the user
- Gently encourage professional help if the user expresses serious distress

Rules:
- Stay focused on mental and emotional wellness only
- Never diagnose medical or psychological conditions
- Never give medical advice or prescribe medication
- Keep responses concise — 2 to 4 sentences unless the user needs more
- Use a warm, friendly tone — not overly clinical
- Do not break character or discuss your underlying technology
- If asked about topics unrelated to wellness, gently redirect the conversation`;

/* ──────────────────────────────────────────────────────────
 * Service
 * ────────────────────────────────────────────────────────── */

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);
  private readonly genAI: GoogleGenerativeAI;

  constructor(
    @Inject(DRIZZLE)
    private readonly db: NeonHttpDatabase<typeof schema>,
  ) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured in environment variables');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  /* ──────────────────────────────────────────────────────────
   * Get history
   * ────────────────────────────────────────────────────────── */

  /**
   * Returns the last N messages for a user, ordered oldest → newest
   * so the chat screen can render them in the correct order.
   */
  async getHistory(supabaseUserId: string) {
    const neonUser = await this.resolveUser(supabaseUserId);

    // Fetch most-recent first, then reverse so the UI gets oldest → newest
    const rows = await this.db
      .select({
        id: chatMessages.id,
        content: chatMessages.content,
        role: chatMessages.role,
        createdAt: chatMessages.createdAt,
      })
      .from(chatMessages)
      .where(eq(chatMessages.userId, neonUser.id))
      .orderBy(desc(chatMessages.createdAt))
      .limit(HISTORY_FETCH_LIMIT);

    return rows.reverse(); // oldest first for the UI
  }

  /* ──────────────────────────────────────────────────────────
   * Send message
   * ────────────────────────────────────────────────────────── */

  /**
   * 1. Persist the user message.
   * 2. Build conversation history for Gemini context.
   * 3. Call Gemini and get a reply.
   * 4. Persist the AI reply.
   * 5. Return both the reply text and the saved message records.
   */
  async sendMessage(supabaseUserId: string, userMessage: string) {
    // Resolve Neon internal user ID from Supabase UUID
    const neonUser = await this.resolveUser(supabaseUserId);
    const neonUserId = neonUser.id;

    // 1. Save user message first (so it exists even if Gemini fails)
    const [savedUserMsg] = await this.db
      .insert(chatMessages)
      .values({ userId: neonUserId, content: userMessage, role: 'user' })
      .returning();

    // 2. Fetch recent history for context (excludes the message we just saved)
    const recentHistory = await this.db
      .select({ content: chatMessages.content, role: chatMessages.role })
      .from(chatMessages)
      .where(eq(chatMessages.userId, neonUserId))
      .orderBy(desc(chatMessages.createdAt))
      .limit(HISTORY_CONTEXT_LIMIT + 1); // +1 because the user msg was just inserted

    // Build Gemini chat history (exclude the latest user message — we send it separately)
    const geminiHistory = recentHistory
      .reverse()
      .slice(0, -1) // remove the last entry (the message we just saved)
      .map((msg) => ({
        role: msg.role === 'user' ? ('user' as const) : ('model' as const),
        parts: [{ text: msg.content }],
      }));

    // 3. Call Gemini
    let replyText: string;
    try {
      const model = this.genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        systemInstruction: SYSTEM_INSTRUCTION,
        safetySettings: [
          { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
          { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
          { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
          { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        ],
      });

      const chat = model.startChat({ history: geminiHistory });
      const result = await chat.sendMessage(userMessage);
      replyText = result.response.text().trim();

      if (!replyText) {
        replyText = "I'm here for you. Could you tell me a bit more about how you're feeling?";
      }
    } catch (error) {
      this.logger.error('Gemini API call failed', error);
      throw new InternalServerErrorException('AI service is temporarily unavailable. Please try again.');
    }

    // 4. Persist AI reply
    const [savedAiMsg] = await this.db
      .insert(chatMessages)
      .values({ userId: neonUserId, content: replyText, role: 'ai' })
      .returning();

    return {
      userMessage: {
        id: savedUserMsg.id,
        content: savedUserMsg.content,
        role: savedUserMsg.role,
        createdAt: savedUserMsg.createdAt,
      },
      aiReply: {
        id: savedAiMsg.id,
        content: savedAiMsg.content,
        role: savedAiMsg.role,
        createdAt: savedAiMsg.createdAt,
      },
    };
  }

  /* ──────────────────────────────────────────────────────────
   * Private: resolve Neon user from Supabase UUID
   *
   * The `chat_messages.user_id` column is a FK referencing
   * `users.id` (Neon's auto-generated UUID), NOT `users.supabase_id`.
   * Every service must call this before any DB write.
   * ────────────────────────────────────────────────────────── */

  private async resolveUser(supabaseId: string) {
    const result = await this.db
      .select()
      .from(users)
      .where(eq(users.supabaseId, supabaseId))
      .limit(1);

    if (!result[0]) {
      throw new NotFoundException(
        'User account not found in database. Please log in again.',
      );
    }

    return result[0];
  }
}
