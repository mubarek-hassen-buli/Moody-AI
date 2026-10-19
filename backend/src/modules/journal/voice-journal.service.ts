import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { GoogleGenerativeAI, Part } from '@google/generative-ai';
import type { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import { DRIZZLE } from '../../core/database/database.module.js';
import { journalEntries } from '../../core/database/schema.js';
import type * as schema from '../../core/database/schema.js';

/* ──────────────────────────────────────────────────────────
 * Constants
 * ────────────────────────────────────────────────────────── */

/** Timeout for Gemini API calls (ms) */
const GEMINI_TIMEOUT_MS = 60_000;

/** Valid mood values matching our database enum */
const VALID_MOODS = ['awful', 'bad', 'okay', 'good', 'great'] as const;
type MoodLevel = (typeof VALID_MOODS)[number];

const VOICE_JOURNAL_PROMPT = `You are Moody, a mental wellness AI. A user just recorded a voice journal entry.

Your job:
1. **Transcribe** the audio accurately.
2. **Clean** the transcript — fix grammar, remove filler words ("um", "uh", "like"), but keep the user's voice and meaning intact. Do NOT rewrite their thoughts.
3. **Generate a short title** (max 10 words) that captures the essence of the entry.
4. **Detect the mood** from the content and tone. Choose exactly one: awful, bad, okay, good, great.

Respond ONLY with valid JSON in this exact format (no markdown, no code fences):
{"title": "...", "content": "...", "mood": "..."}`;

@Injectable()
export class VoiceJournalService {
  private readonly logger = new Logger(VoiceJournalService.name);
  private readonly genAI: GoogleGenerativeAI;

  constructor(
    @Inject(DRIZZLE)
    private readonly db: NeonHttpDatabase<typeof schema>,
  ) {
    const apiKey = process.env.GEMINI_API_KEY_VOICE;
    if (!apiKey) {
      throw new Error(
        'GEMINI_API_KEY_VOICE is not configured in environment variables',
      );
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  /* ──────────────────────────────────────────────────────────
   * Process voice journal
   * ────────────────────────────────────────────────────────── */

  async processVoiceEntry(userId: string, audioBase64: string) {
    const { mimeType, data } = this.parseAudioData(audioBase64);

    const audioPart: Part = {
      inlineData: { mimeType, data },
    };

    const textPart: Part = {
      text: VOICE_JOURNAL_PROMPT,
    };

    let geminiResponse: string;
    try {
      const model = this.genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
      });

      const result = await Promise.race([
        model.generateContent([audioPart, textPart]),
        new Promise<never>((_, reject) =>
          setTimeout(
            () => reject(new Error('Gemini voice API timeout')),
            GEMINI_TIMEOUT_MS,
          ),
        ),
      ]);

      geminiResponse = result.response.text().trim();
    } catch (error) {
      this.logger.error('Gemini voice processing failed', error);
      throw new InternalServerErrorException(
        'Voice processing is temporarily unavailable. Please try again.',
      );
    }

    const { title, content, mood } = this.parseGeminiResponse(geminiResponse);

    // Save the journal entry along with the detected mood directly
    const [entry] = await this.db
      .insert(journalEntries)
      .values({
        userId,
        title,
        content,
        detectedMood: mood as any,
      })
      .returning();

    this.logger.log(`Voice journal saved: "${title}" (mood: ${mood}) for user ${userId}`);

    return {
      entry,
      mood,
    };
  }

  private parseAudioData(audioBase64: string): {
    mimeType: string;
    data: string;
  } {
    const dataUriMatch = audioBase64.match(
      /^data:(audio\/[\w.+-]+);base64,(.+)$/,
    );

    if (dataUriMatch) {
      return { mimeType: dataUriMatch[1], data: dataUriMatch[2] };
    }

    return { mimeType: 'audio/wav', data: audioBase64 };
  }

  private parseGeminiResponse(raw: string): {
    title: string;
    content: string;
    mood: MoodLevel;
  } {
    try {
      const cleaned = raw
        .replace(/^```(?:json)?\s*\n?/i, '')
        .replace(/\n?```\s*$/i, '')
        .trim();

      const parsed = JSON.parse(cleaned);

      const title =
        typeof parsed.title === 'string' && parsed.title.trim()
          ? parsed.title.trim()
          : 'Voice Journal Entry';

      const content =
        typeof parsed.content === 'string' && parsed.content.trim()
          ? parsed.content.trim()
          : '';

      if (!content) {
        throw new BadRequestException(
          'Could not transcribe the audio. Please try speaking more clearly.',
        );
      }

      const mood: MoodLevel = VALID_MOODS.includes(parsed.mood)
        ? parsed.mood
        : 'okay';

      return { title, content, mood };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;

      this.logger.warn(`Failed to parse Gemini response: ${raw}`);
      throw new BadRequestException(
        'Could not process the audio. Please try again.',
      );
    }
  }
}
