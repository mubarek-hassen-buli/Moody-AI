import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { GoogleGenerativeAI, Part } from '@google/generative-ai';
import { eq } from 'drizzle-orm';
import type { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import { DRIZZLE } from '../../core/database/database.module.js';
import { journalEntries, users } from '../../core/database/schema.js';
import type * as schema from '../../core/database/schema.js';

/* ──────────────────────────────────────────────────────────
 * Constants
 * ────────────────────────────────────────────────────────── */

/** Timeout for Gemini API calls (ms) */
const GEMINI_TIMEOUT_MS = 30_000;

/** Valid mood values that match our database enum */
const VALID_MOODS = ['awful', 'bad', 'okay', 'good', 'great'] as const;
type MoodLevel = (typeof VALID_MOODS)[number];

/**
 * Prompt that instructs Gemini to transcribe audio,
 * clean the text, generate a title, and detect the mood.
 */
const VOICE_JOURNAL_PROMPT = `You are Moody, a mental wellness AI. A user just recorded a voice journal entry.

Your job:
1. **Transcribe** the audio accurately.
2. **Clean** the transcript — fix grammar, remove filler words ("um", "uh", "like"), but keep the user's voice and meaning intact. Do NOT rewrite their thoughts.
3. **Generate a short title** (max 10 words) that captures the essence of the entry.
4. **Detect the mood** from the content and tone. Choose exactly one: awful, bad, okay, good, great.

Respond ONLY with valid JSON in this exact format (no markdown, no code fences):
{"title": "...", "content": "...", "mood": "..."}`;

/* ──────────────────────────────────────────────────────────
 * Service
 * ────────────────────────────────────────────────────────── */

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

  /**
   * Accept a base64-encoded audio recording, send it to Gemini
   * for transcription + mood detection, and save the result
   * as a journal entry.
   */
  async processVoiceEntry(supabaseUserId: string, audioBase64: string) {
    const neonUser = await this.resolveUser(supabaseUserId);

    /* ── Prepare the audio for Gemini ──────────────────── */
    const { mimeType, data } = this.parseAudioData(audioBase64);

    const audioPart: Part = {
      inlineData: { mimeType, data },
    };

    const textPart: Part = {
      text: VOICE_JOURNAL_PROMPT,
    };

    /* ── Call Gemini ───────────────────────────────────── */
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

    /* ── Parse the structured response ────────────────── */
    const { title, content, mood } = this.parseGeminiResponse(geminiResponse);

    /* ── Save the journal entry ───────────────────────── */
    const [entry] = await this.db
      .insert(journalEntries)
      .values({
        userId: neonUser.id,
        title,
        content,
      })
      .returning();

    this.logger.log(`Voice journal saved: "${title}" (mood: ${mood})`);

    return {
      entry,
      mood,
    };
  }

  /* ──────────────────────────────────────────────────────────
   * Private helpers
   * ────────────────────────────────────────────────────────── */

  /**
   * Extract the MIME type and raw base64 data from the input.
   * Handles both data-URI format and raw base64.
   */
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

    // Default to WAV if no data URI prefix is provided
    return { mimeType: 'audio/wav', data: audioBase64 };
  }

  /**
   * Parse and validate the JSON response from Gemini.
   * Falls back gracefully if the response is malformed.
   */
  private parseGeminiResponse(raw: string): {
    title: string;
    content: string;
    mood: MoodLevel;
  } {
    try {
      // Strip markdown code fences if Gemini wraps the JSON
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

  /**
   * Resolve the Neon internal user from a Supabase UUID.
   */
  private async resolveUser(supabaseId: string) {
    const result = await this.db
      .select()
      .from(users)
      .where(eq(users.supabaseId, supabaseId))
      .limit(1);

    if (!result[0]) {
      throw new NotFoundException(
        'User account not found. Please log in again.',
      );
    }

    return result[0];
  }
}
