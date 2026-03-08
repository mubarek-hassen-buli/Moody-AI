import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { eq, sql } from 'drizzle-orm';
import type { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import { DRIZZLE } from '../../core/database/database.module.js';
import { dailyQuotes } from '../../core/database/schema.js';
import type * as schema from '../../core/database/schema.js';
import { SEED_QUOTES } from './seed-quotes.js';

@Injectable()
export class QuoteService implements OnModuleInit {
  private readonly logger = new Logger(QuoteService.name);

  constructor(
    @Inject(DRIZZLE)
    private readonly db: NeonHttpDatabase<typeof schema>,
  ) {}

  /* ─────────────────────────────────────────────────────────
   * Seed quotes on first launch
   * ───────────────────────────────────────────────────────── */

  async onModuleInit() {
    await this.seedIfEmpty();
  }

  private async seedIfEmpty() {
    const existing = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(dailyQuotes);

    const count = Number(existing[0]?.count ?? 0);

    if (count > 0) {
      this.logger.log(`Quotes table already has ${count} entries — skipping seed.`);
      return;
    }

    this.logger.log('Seeding quotes table with motivational quotes…');

    const values = SEED_QUOTES.map((q, i) => ({
      quoteText: q.text,
      author: q.author,
      // Spread seed quotes across past dates so they don't all share the same date
      date: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
    }));

    await this.db.insert(dailyQuotes).values(values);
    this.logger.log(`✅ Seeded ${values.length} quotes.`);
  }

  /* ─────────────────────────────────────────────────────────
   * Get today's quote
   * If no quote is assigned for today, pick a random one.
   * ───────────────────────────────────────────────────────── */

  async getToday() {
    // Try to find a quote with today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayResults = await this.db
      .select()
      .from(dailyQuotes)
      .where(
        sql`${dailyQuotes.date} >= ${today} AND ${dailyQuotes.date} < ${tomorrow}`,
      )
      .limit(1);

    if (todayResults.length > 0) {
      return todayResults[0];
    }

    // No quote assigned today — pick a random one and update its date
    return this.assignRandomForToday(today);
  }

  /* ─────────────────────────────────────────────────────────
   * Get a random quote (for the refresh button)
   * ───────────────────────────────────────────────────────── */

  async getRandom() {
    const results = await this.db
      .select()
      .from(dailyQuotes)
      .orderBy(sql`RANDOM()`)
      .limit(1);

    return results[0] ?? null;
  }

  /* ─────────────────────────────────────────────────────────
   * Private: assign a random quote to today
   * ───────────────────────────────────────────────────────── */

  private async assignRandomForToday(today: Date) {
    const random = await this.getRandom();
    if (!random) return null;

    // Update this quote's date to today
    const [updated] = await this.db
      .update(dailyQuotes)
      .set({ date: today })
      .where(eq(dailyQuotes.id, random.id))
      .returning();

    return updated;
  }
}
