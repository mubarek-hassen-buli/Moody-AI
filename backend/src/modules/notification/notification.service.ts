import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { and, eq, sql } from 'drizzle-orm';
import { Expo, ExpoPushMessage } from 'expo-server-sdk';
import type { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import { DRIZZLE } from '../../core/database/database.module.js';
import { moodEntries, pushTokens, users } from '../../core/database/schema.js';
import type * as schema from '../../core/database/schema.js';
import { QuoteService } from '../quote/quote.service.js';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private expo = new Expo();

  constructor(
    @Inject(DRIZZLE)
    private readonly db: NeonHttpDatabase<typeof schema>,
    private readonly quoteService: QuoteService,
  ) {}

  /* ─────────────────────────────────────────────────────────
   * Token Management
   * ───────────────────────────────────────────────────────── */

  async registerToken(userId: string, token: string) {
    await this.db
      .insert(pushTokens)
      .values({
        userId,
        token,
      })
      .onConflictDoUpdate({
        target: pushTokens.token,
        set: { userId, updatedAt: new Date() },
      });

    this.logger.log(`Registered push token for user ${userId}`);
  }

  /* ─────────────────────────────────────────────────────────
   * Daily Quote Notification (Every day at 9:00 AM)
   * ───────────────────────────────────────────────────────── */

  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async handleDailyQuoteCron() {
    this.logger.log('Running Daily Quote notification job...');
    const quote = await this.quoteService.getToday();
    if (!quote) return;

    const allTokens = await this.db.select().from(pushTokens);
    if (allTokens.length === 0) return;

    const messages: ExpoPushMessage[] = allTokens.map((t) => ({
      to: t.token,
      sound: 'default',
      title: 'Daily Inspiration 🌅',
      body: `"${quote.quoteText}" — ${quote.author ?? 'Daily Inspiration'}`,
      data: { type: 'quote' },
    }));

    await this.sendBatch(messages);
  }

  /* ─────────────────────────────────────────────────────────
   * Mood Reminder Notification (Every day at 8:00 PM)
   * ───────────────────────────────────────────────────────── */

  @Cron(CronExpression.EVERY_DAY_AT_8PM)
  async handleMoodReminderCron() {
    this.logger.log('Running Mood Reminder notification job...');

    const todayDate = new Date().toISOString().split('T')[0];

    // Find users who have NOT logged a mood today
    const usersToRemind = await this.db
      .select({
        userId: users.id,
        token: pushTokens.token,
      })
      .from(users)
      .innerJoin(pushTokens, eq(users.id, pushTokens.userId))
      .where(
        sql`NOT EXISTS (
          SELECT 1 FROM ${moodEntries}
          WHERE ${moodEntries.userId} = ${users.id}
          AND ${moodEntries.entryDate} = ${todayDate}
        )`,
      );

    if (usersToRemind.length === 0) return;

    const messages: ExpoPushMessage[] = usersToRemind.map((u) => ({
      to: u.token,
      sound: 'default',
      title: 'How are you feeling? 🌙',
      body: 'Take a moment to check in with yourself and log your mood for today.',
      data: { type: 'mood_reminder' },
    }));

    await this.sendBatch(messages);
  }

  /* ─────────────────────────────────────────────────────────
   * Batch Sending with Expo
   * ───────────────────────────────────────────────────────── */

  private async sendBatch(messages: ExpoPushMessage[]) {
    const chunks = this.expo.chunkPushNotifications(messages);

    for (const chunk of chunks) {
      try {
        await this.expo.sendPushNotificationsAsync(chunk);
      } catch (error) {
        this.logger.error('Error sending push notification chunk:', error);
      }
    }

    this.logger.log(`Sent ${messages.length} notifications in ${chunks.length} chunks.`);
  }
}
