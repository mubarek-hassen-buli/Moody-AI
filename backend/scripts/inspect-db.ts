import 'dotenv/config';
import './neon-dispatcher.js';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

async function run() {
  console.log('Inspecting Neon Database tables...');
  const tables = await sql`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
  `;
  console.log('Public tables found:', tables.map((t: any) => t.table_name));

  for (const t of tables as any[]) {
    try {
      const count = await sql.query(`SELECT count(*)::int as c FROM "${t.table_name}"`);
      console.log(`Table "${t.table_name}": ${count[0].c} rows`);
    } catch (e: any) {
      console.log(`Could not count "${t.table_name}":`, e.message);
    }
  }

  // Also check if neon_auth schema exists!
  const neonAuthTables = await sql`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'neon_auth' AND table_type = 'BASE TABLE'
  `;
  console.log('neon_auth tables found:', neonAuthTables.map((t: any) => t.table_name));
}

run().catch((err) => {
  console.error('Inspection failed:', err);
  process.exit(1);
});
