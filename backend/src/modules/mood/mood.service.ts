import { Inject, Injectable } from '@nestjs/common';
import { and, desc, eq, gte, lte, sql } from 'drizzle-orm';
import type { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import { DRIZZLE } from '../../core/database/database.module.js';
import { moodEntries } from '../../core/database/schema.js';
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

  /**
   * Helper to get today's date formatted as YYYY-MM-DD.
   */
  private getTodayDateString(): string {
    return new Date().toISOString().split('T')[0];
  }

  /* ─────────────────────────────────────────────────────────
   * Get today's mood entry (or null)
   * ───────────────────────────────────────────────────────── */

  async getTodayMood(userId: string) {
    const todayDate = this.getTodayDateString();

    const entries = await this.db
      .select()
      .from(moodEntries)
      .where(
        and(
          eq(moodEntries.userId, userId),
          eq(moodEntries.entryDate, todayDate),
        ),
      )
      .limit(1);

    return entries[0] ?? null;
  }

  /* ─────────────────────────────────────────────────────────
   * Create or update today's mood entry (Atomic Upsert)
   *
   * Uses database constraint ON CONFLICT (user_id, entry_date)
   * to guarantee race-condition-free updates without duplicate rows.
   * ───────────────────────────────────────────────────────── */

  async create(userId: string, dto: CreateMoodDto) {
    const todayDate = this.getTodayDateString();

    const [entry] = await this.db
      .insert(moodEntries)
      .values({
        userId,
        mood: dto.mood as any,
        note: dto.note ?? null,
        entryDate: todayDate,
      })
      .onConflictDoUpdate({
        target: [moodEntries.userId, moodEntries.entryDate],
        set: {
          mood: dto.mood as any,
          note: dto.note !== undefined ? dto.note : sql`${moodEntries.note}`,
          updatedAt: new Date(),
        },
      })
      .returning();

    return entry;
  }

  /* ─────────────────────────────────────────────────────────
   * Weekly mood list (last 7 days)
   * ───────────────────────────────────────────────────────── */

  async getWeekly(userId: string) {
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const entries = await this.db
      .select()
      .from(moodEntries)
      .where(
        and(
          eq(moodEntries.userId, userId),
          gte(moodEntries.createdAt, sevenDaysAgo),
          lte(moodEntries.createdAt, now),
        ),
      )
      .orderBy(moodEntries.createdAt);

    const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const days: { day: string; score: number | null }[] = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const label = dayLabels[date.getDay()];

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
   * Emotion breakdown stats (SQL Aggregated GROUP BY)
   * ───────────────────────────────────────────────────────── */

  async getStats(userId: string) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Database aggregation query replacing in-memory processing
    const result = await this.db.execute(sql`
      SELECT mood, COUNT(*)::int as count 
      FROM mood_entries 
      WHERE user_id = ${userId} AND created_at >= ${thirtyDaysAgo} 
      GROUP BY mood
    `);

    const rows: { mood: string; count: number }[] =
      (result as any).rows ?? (result as any) ?? [];

    const total = rows.reduce((sum, r) => sum + Number(r.count), 0);

    if (total === 0) {
      return { total: 0, breakdown: [] };
    }

    const breakdown = rows
      .map((r) => ({
        mood: r.mood,
        label: MOOD_TO_EMOTION_LABEL[r.mood] ?? r.mood,
        percentage: Math.round((Number(r.count) / total) * 100),
        color: EMOTION_COLORS[r.mood] ?? '#9E9E9E',
      }))
      .sort((a, b) => b.percentage - a.percentage);

    return { total, breakdown };
  }
}
