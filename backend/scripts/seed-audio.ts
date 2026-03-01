import 'dotenv/config';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '../src/core/database/schema';

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

const urls = [
  'https://ygkepuokloqilxrbxbql.supabase.co/storage/v1/object/public/audio-sessions/In-Pursuit%20-%20Siine.mp3',
  'https://ygkepuokloqilxrbxbql.supabase.co/storage/v1/object/public/audio-sessions/Into-the-Night%20-%20Hallmore.mp3',
  'https://ygkepuokloqilxrbxbql.supabase.co/storage/v1/object/public/audio-sessions/Pose%20-%20ALICE.mp3',
  'https://ygkepuokloqilxrbxbql.supabase.co/storage/v1/object/public/audio-sessions/Supernovas%20-%20Hallman.mp3',
  'https://ygkepuokloqilxrbxbql.supabase.co/storage/v1/object/public/audio-sessions/Ur-Face%20-%20LeDorean.mp3',
  'https://ygkepuokloqilxrbxbql.supabase.co/storage/v1/object/public/audio-sessions/MENTAL%20-%20Manuelo%20Jersey.mp3'
];

async function seed() {
  console.log('🚀 Starting workout audio seed process...');
  
  for (const url of urls) {
    const rawFilename = url.split('/').pop() || '';
    // Decode the URI component (%20 to space, etc) and remove the .mp3 extension
    let title = decodeURIComponent(rawFilename).replace('.mp3', '');
    
    console.log(`Inserting: "${title}"`);
    
    await db.insert(schema.audioTracks).values({
      title,
      // Author column is optional in the Drizzle schema, so we omit it
      duration: '3:00', // As per user request, all new ones are 3 minutes
      category: 'workout',
      audioUrl: url,
    });
  }
  
  console.log('✅ Successfully seeded all workout audio tracks to Neon Database!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Error during seed:', err);
  process.exit(1);
});
