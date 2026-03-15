import { Inject, Injectable } from '@nestjs/common';
import { and, desc, eq, gte, lte, sql } from 'drizzle-orm';
import type { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import { DRIZZLE } from '../../core/database/database.module.js';
import { moodEntries, users } from '../../core/database/schema.js';
import type * as schema from '../../core/database/schema.js';
import { CreateMoodDto } from './dto/create-mood.dto.js';

/* ──────────────────────────────────────────────────────────
 * Mood level → numeric score (for chart rendering)
 * ────────────────────────────────────────────────────────── */

const MOOD_SCORE: Record<string, number> = {
  awful: 1,
  bad: 2,
  okay: 3,
  good: 4,
  great: 5,
};

const MOOD_TO_EMOTION_LABEL: Record<string, string> = {
  awful: 'Awful',
  bad: 'Sad',
  okay: 'Calm',
  good: 'Happy',
  great: 'Great',
};

const EMOTION_COLORS: Record<string, string> = {
  great: '#F07033',
  good: '#F8A775',
  okay: '#9E9E9E',
  bad: '#64B5F6',
  awful: '#EF5350',
};

@Injectable()
export class MoodService {
  constructor(
    @Inject(DRIZZLE)
    private readonly db: NeonHttpDatabase<typeof schema>,
  ) {}

  /* ─────────────────────────────────────────────────────────
   * Get today's mood entry (or null)
   * ───────────────────────────────────────────────────────── */

  async getTodayMood(supabaseUserId: string) {
    const neonUser = await this.resolveUser(supabaseUserId);

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const entries = await this.db
      .select()
      .from(moodEntries)
      .where(
        and(
          eq(moodEntries.userId, neonUser.id),
          gte(moodEntries.createdAt, todayStart),
          lte(moodEntries.createdAt, todayEnd),
        ),
      )
      .orderBy(desc(moodEntries.createdAt))
      .limit(1);

    return entries[0] ?? null;
  }

  /* ─────────────────────────────────────────────────────────
   * Create or update today's mood entry (upsert)
   *
   * If the user already logged a mood today, update it.
   * Otherwise, insert a new row.
   * ───────────────────────────────────────────────────────── */

  async create(supabaseUserId: string, dto: CreateMoodDto) {
    const neonUser = await this.resolveUser(supabaseUserId);

    // Check if a mood entry already exists for today
    const existing = await this.getTodayMoodByNeonId(neonUser.id);

    if (existing) {
      // Update the existing entry instead of creating a duplicate
      const [updated] = await this.db
        .update(moodEntries)
        .set({
          mood: dto.mood as any,
          note: dto.note ?? existing.note,
        })
        .where(eq(moodEntries.id, existing.id))
        .returning();

      return updated;
    }

    // No entry for today — insert a new one
    const [entry] = await this.db
      .insert(moodEntries)
      .values({
        userId: neonUser.id,
        mood: dto.mood as any,
        note: dto.note ?? null,
      })
      .returning();

    return entry;
  }

  /* ─────────────────────────────────────────────────────────
   * Weekly mood list (last 7 days)
   * ───────────────────────────────────────────────────────── */

  async getWeekly(supabaseUserId: string) {
    const neonUser = await this.resolveUser(supabaseUserId);
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const entries = await this.db
      .select()
      .from(moodEntries)
      .where(
        and(
          eq(moodEntries.userId, neonUser.id),
          gte(moodEntries.createdAt, sevenDaysAgo),
          lte(moodEntries.createdAt, now),
        ),
      )
      .orderBy(moodEntries.createdAt);

    // Build a day-by-day map for the last 7 days
    const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const days: { day: string; score: number | null }[] = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const label = dayLabels[date.getDay()];

      // Find the last entry logged on this date
      const match = entries
        .filter(
          (e) => new Date(e.createdAt).toDateString() === date.toDateString(),
        )
        .pop();

      days.push({ day: label, score: match ? MOOD_SCORE[match.mood] : null });
    }

    return days;
  }

  /* ─────────────────────────────────────────────────────────
   * Emotion breakdown stats (percentage per mood, last 30 days)
   * ───────────────────────────────────────────────────────── */

  async getStats(supabaseUserId: string) {
    const neonUser = await this.resolveUser(supabaseUserId);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const entries = await this.db
      .select()
      .from(moodEntries)
      .where(
        and(
          eq(moodEntries.userId, neonUser.id),
          gte(moodEntries.createdAt, thirtyDaysAgo),
        ),
      );

    const total = entries.length;

    if (total === 0) {
      return { total: 0, breakdown: [] };
    }

    // Count occurrences per mood level
    const counts: Record<string, number> = {
      great: 0,
      good: 0,
      okay: 0,
      bad: 0,
      awful: 0,
    };

    for (const entry of entries) {
      counts[entry.mood] = (counts[entry.mood] ?? 0) + 1;
    }

    // Calculate percentages and sort by frequency desc
    const breakdown = Object.entries(counts)
      .filter(([, count]) => count > 0)
      .map(([mood, count]) => ({
        mood,
        label: MOOD_TO_EMOTION_LABEL[mood],
        percentage: Math.round((count / total) * 100),
        color: EMOTION_COLORS[mood],
      }))
      .sort((a, b) => b.percentage - a.percentage);

    return { total, breakdown };
  }

  /* ─────────────────────────────────────────────────────────
   * Private: get today's mood by Neon user ID
   *
   * Internal helper used by create() to avoid a double
   * resolveUser call.
   * ───────────────────────────────────────────────────────── */

  private async getTodayMoodByNeonId(neonUserId: string) {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const entries = await this.db
      .select()
      .from(moodEntries)
      .where(
        and(
          eq(moodEntries.userId, neonUserId),
          gte(moodEntries.createdAt, todayStart),
          lte(moodEntries.createdAt, todayEnd),
        ),
      )
      .orderBy(desc(moodEntries.createdAt))
      .limit(1);

    return entries[0] ?? null;
  }

  /* ─────────────────────────────────────────────────────────
   * Private: resolve Neon user from Supabase ID
   * ───────────────────────────────────────────────────────── */

  private async resolveUser(supabaseId: string) {
    const result = await this.db
      .select()
      .from(users)
      .where(eq(users.supabaseId, supabaseId))
      .limit(1);

    if (!result[0]) {
      throw new Error('User not found in database');
    }

    return result[0];
  }
}
