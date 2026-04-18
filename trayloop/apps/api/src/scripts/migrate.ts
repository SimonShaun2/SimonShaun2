import postgres from 'postgres';
import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';

// cwd is apps/api when run via npm workspace script
const migrationsDir = resolve(process.cwd(), '../../packages/database/src/migrations');

const DATABASE_URL =
  process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/trayloop';

async function runMigrations() {
  const sql = postgres(DATABASE_URL, {
    max: 1,
    onnotice: () => {}, // suppress NOTICE/WARNING messages (e.g. "relation already exists")
  });

  try {
    await sql`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        filename TEXT PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `;

    const applied = await sql<{ filename: string }[]>`
      SELECT filename FROM schema_migrations ORDER BY filename
    `;
    const appliedSet = new Set(applied.map((r) => r.filename));

    const files = readdirSync(migrationsDir)
      .filter((f) => f.endsWith('.sql') && !f.endsWith('.rollback.sql'))
      .sort();

    let newCount = 0;

    for (const filename of files) {
      if (appliedSet.has(filename)) {
        console.log(`skipping: ${filename} (already applied)`);
        continue;
      }

      const sqlText = readFileSync(resolve(migrationsDir, filename), 'utf-8').trim();
      console.log(`Applying migration: ${filename}`);

      await sql.begin(async (tx) => {
        await tx.unsafe(sqlText);
        await tx`INSERT INTO schema_migrations (filename) VALUES (${filename})`;
      });

      console.log(`  done: ${filename}`);
      newCount++;
    }

    if (newCount === 0) {
      console.log('No pending migrations.');
    } else {
      console.log(`Applied ${newCount} migration(s).`);
    }
  } finally {
    await sql.end();
  }
}

runMigrations().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
