import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { eq, desc } from 'drizzle-orm';
import type { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import {
  GoogleGenerativeAI,
  HarmBlockThreshold,
  HarmCategory,
} from '@google/generative-ai';
import { DRIZZLE } from '../../core/database/database.module.js';
import { chatMessages } from '../../core/database/schema.js';
import type * as schema from '../../core/database/schema.js';

/* ──────────────────────────────────────────────────────────
 * Constants
 * ────────────────────────────────────────────────────────── */

/** Number of past messages fed to Gemini as conversation context */
const HISTORY_CONTEXT_LIMIT = 20;

/** Number of messages returned to the client for the chat screen */
const HISTORY_FETCH_LIMIT = 50;

/** Maximum allowed length for a single user message */
const MAX_MESSAGE_LENGTH = 2000;

/** Timeout for Gemini API calls in milliseconds */
const GEMINI_TIMEOUT_MS = 15_000;

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
   * Returns the last N messages for a user, ordered oldest → newest.
   */
  async getHistory(userId: string) {
    const rows = await this.db
      .select({
        id: chatMessages.id,
        content: chatMessages.content,
        role: chatMessages.role,
        createdAt: chatMessages.createdAt,
      })
      .from(chatMessages)
      .where(eq(chatMessages.userId, userId))
      .orderBy(desc(chatMessages.createdAt))
      .limit(HISTORY_FETCH_LIMIT);

    return rows.reverse();
  }

  /* ──────────────────────────────────────────────────────────
   * Send message
   * ────────────────────────────────────────────────────────── */

  async sendMessage(userId: string, userMessage: string) {
    if (!userMessage || userMessage.trim().length === 0) {
      throw new BadRequestException('Message cannot be empty.');
    }
    if (userMessage.length > MAX_MESSAGE_LENGTH) {
      throw new BadRequestException(
        `Message too long (${userMessage.length} chars). Maximum is ${MAX_MESSAGE_LENGTH}.`,
      );
    }

    // 1. Save user message first
    const [savedUserMsg] = await this.db
      .insert(chatMessages)
      .values({ userId, content: userMessage, role: 'user' })
      .returning();

    // 2. Fetch recent history for context
    const recentHistory = await this.db
      .select({ content: chatMessages.content, role: chatMessages.role })
      .from(chatMessages)
      .where(eq(chatMessages.userId, userId))
      .orderBy(desc(chatMessages.createdAt))
      .limit(HISTORY_CONTEXT_LIMIT + 1);

    const geminiHistory = recentHistory
      .reverse()
      .slice(0, -1)
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

      const result = await Promise.race([
        chat.sendMessage(userMessage),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Gemini API timeout')), GEMINI_TIMEOUT_MS),
        ),
      ]);

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
      .values({ userId, content: replyText, role: 'ai' })
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
}
