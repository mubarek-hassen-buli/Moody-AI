import 'dotenv/config';
import './neon-dispatcher.js';
import { neon } from '@neondatabase/serverless';
import * as fs from 'fs';
import * as path from 'path';

const sql = neon(process.env.DATABASE_URL!);

async function migrate() {
  console.log('🚀 Running Moody-AI Database Migration for Neon Auth...');

  const sqlPath = path.join(process.cwd(), 'drizzle', '0000_furry_tomas.sql');
  const sqlContent = fs.readFileSync(sqlPath, 'utf-8');

  // Statements separated by Drizzle's breakpoint comment
  const statements = sqlContent
    .split('--> statement-breakpoint')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  console.log(`Found ${statements.length} migration statements to apply.`);

  // Preserve existing daily_quotes if any
  let existingQuotes: any[] = [];
  try {
    existingQuotes = await sql.query('SELECT quote_text, author, date FROM daily_quotes');
    console.log(`Preserved ${existingQuotes.length} existing daily quotes to re-insert.`);
  } catch (err: any) {
    console.log('No prior daily_quotes to preserve.');
  }

  // Drop old conflicting tables from the previous Supabase schema
  console.log('Cleaning up old schema foreign keys and constraints...');
  const dropOldSchema = [
    'DROP TABLE IF EXISTS "push_tokens" CASCADE',
    'DROP TABLE IF EXISTS "chat_messages" CASCADE',
    'DROP TABLE IF EXISTS "journal_entries" CASCADE',
    'DROP TABLE IF EXISTS "mood_entries" CASCADE',
    'DROP TABLE IF EXISTS "users" CASCADE',
    'DROP TABLE IF EXISTS "audio_tracks" CASCADE',
    'DROP TABLE IF EXISTS "daily_quotes" CASCADE',
    'DROP TYPE IF EXISTS "public"."audio_category" CASCADE',
    'DROP TYPE IF EXISTS "public"."chat_role" CASCADE',
    'DROP TYPE IF EXISTS "public"."mood_level" CASCADE',
  ];

  for (const dropSql of dropOldSchema) {
    try {
      await sql.query(dropSql);
    } catch (err: any) {
      console.warn(`Drop warning (non-fatal): ${err.message}`);
    }
  }

  // Execute each migration statement
  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    try {
      await sql.query(stmt);
      console.log(`[${i + 1}/${statements.length}] Applied statement successfully.`);
    } catch (err: any) {
      console.error(`Error on statement ${i + 1}:`, stmt);
      console.error(err);
      process.exit(1);
    }
  }

  // Re-insert daily quotes if preserved
  if (existingQuotes.length > 0) {
    console.log(`Restoring ${existingQuotes.length} daily quotes...`);
    for (const q of existingQuotes) {
      await sql.query(
        'INSERT INTO daily_quotes (quote_text, author, date) VALUES ($1, $2, $3)',
        [q.quote_text, q.author, q.date],
      );
    }
    console.log('✅ Daily quotes restored successfully.');
  }

  console.log('✅ All tables, composite indexes, and foreign keys applied successfully to Neon!');
  process.exit(0);
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
