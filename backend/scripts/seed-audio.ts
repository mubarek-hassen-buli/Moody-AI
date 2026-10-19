import 'dotenv/config';
import './neon-dispatcher.js';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '../src/core/database/schema.js';

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

const s3Endpoint = process.env.AWS_ENDPOINT_URL_S3 || 'https://ep-weathered-flower-b4mcbnhk.storage.c-6.us-east-2.aws.neon.tech';
const bucket = process.env.NEON_STORAGE_BUCKET || 'assets';

// Neon Object Storage base URL for assets
const storageBaseUrl = `${s3Endpoint}/${bucket}/audio-tracks`;

const tracks = [
  {
    title: 'In Pursuit - Siine',
    duration: '3:00',
    category: 'workout' as const,
    filename: 'In-Pursuit - Siine.mp3',
  },
  {
    title: 'Into the Night - Hallmore',
    duration: '3:00',
    category: 'workout' as const,
    filename: 'Into-the-Night - Hallmore.mp3',
  },
  {
    title: 'Pose - ALICE',
    duration: '3:00',
    category: 'workout' as const,
    filename: 'Pose - ALICE.mp3',
  },
  {
    title: 'Supernovas - Hallman',
    duration: '3:00',
    category: 'workout' as const,
    filename: 'Supernovas - Hallman.mp3',
  },
  {
    title: 'Ur Face - LeDorean',
    duration: '3:00',
    category: 'workout' as const,
    filename: 'Ur-Face - LeDorean.mp3',
  },
  {
    title: 'MENTAL - Manuelo Jersey',
    duration: '3:00',
    category: 'workout' as const,
    filename: 'MENTAL - Manuelo Jersey.mp3',
  },
  {
    title: 'Deep Meditation & Gentle Waves',
    duration: '5:00',
    category: 'relaxing' as const,
    filename: 'Deep-Meditation.mp3',
  },
  {
    title: 'Forest Rain & Calm Mind',
    duration: '4:30',
    category: 'relaxing' as const,
    filename: 'Forest-Rain.mp3',
  },
];

async function seed() {
  console.log('🚀 Starting audio seed process for Neon Storage...');
  
  for (const track of tracks) {
    const audioUrl = `${storageBaseUrl}/${encodeURIComponent(track.filename)}`;
    console.log(`Seeding track [${track.category}]: "${track.title}" -> ${audioUrl}`);
    
    await db.insert(schema.audioTracks).values({
      title: track.title,
      duration: track.duration,
      category: track.category,
      audioUrl,
    });
  }
  
  console.log('✅ Successfully seeded audio tracks to Neon Database!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Error during seed:', err);
  process.exit(1);
});
