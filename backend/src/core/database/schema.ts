import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  pgEnum,
} from 'drizzle-orm/pg-core';

/* ──────────────────────────────────────────────────────────
 * Enums
 * ────────────────────────────────────────────────────────── */

export const moodLevelEnum = pgEnum('mood_level', [
  'awful',
  'bad',
  'okay',
  'good',
  'great',
]);

export const audioCategoryEnum = pgEnum('audio_category', [
  'relaxing',
  'workout',
]);

export const chatRoleEnum = pgEnum('chat_role', ['user', 'ai']);

/* ──────────────────────────────────────────────────────────
 * Users
 * ────────────────────────────────────────────────────────── */

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  supabaseId: varchar('supabase_id', { length: 255 }).notNull().unique(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/* ──────────────────────────────────────────────────────────
 * Mood Entries
 * ────────────────────────────────────────────────────────── */

export const moodEntries = pgTable('mood_entries', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  mood: moodLevelEnum('mood').notNull(),
  note: text('note'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/* ──────────────────────────────────────────────────────────
 * Journal Entries
 * ────────────────────────────────────────────────────────── */

export const journalEntries = pgTable('journal_entries', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 500 }).notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/* ──────────────────────────────────────────────────────────
 * Audio Tracks
 * ────────────────────────────────────────────────────────── */

export const audioTracks = pgTable('audio_tracks', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 500 }).notNull(),
  author: varchar('author', { length: 255 }),
  duration: varchar('duration', { length: 20 }).notNull(),
  category: audioCategoryEnum('category').notNull(),
  audioUrl: text('audio_url').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/* ──────────────────────────────────────────────────────────
 * Daily Quotes
 * ────────────────────────────────────────────────────────── */

export const dailyQuotes = pgTable('daily_quotes', {
  id: uuid('id').primaryKey().defaultRandom(),
  quoteText: text('quote_text').notNull(),
  author: varchar('author', { length: 255 }),
  date: timestamp('date', { withTimezone: true }).notNull(),
});

/* ──────────────────────────────────────────────────────────
 * Chat Messages
 * ────────────────────────────────────────────────────────── */

export const chatMessages = pgTable('chat_messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  role: chatRoleEnum('role').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});
