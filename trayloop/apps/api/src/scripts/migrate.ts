import { db } from '@trayloop/database';
import { sql } from 'drizzle-orm';
import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';

// cwd is apps/api when run via npm workspace script
const migrationsDir = resolve(process.cwd(), '../../packages/database/src/migrations');

async function ensureMigrationsTable() {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      filename TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);
}

async function getAppliedMigrations(): Promise<Set<string>> {
  const rows = await db.execute<{ filename: string }>(
    sql`SELECT filename FROM schema_migrations ORDER BY filename`,
  );
  return new Set(rows.map((r) => r.filename));
}

async function runMigrations() {
  await ensureMigrationsTable();

  const applied = await getAppliedMigrations();

  const files = readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql') && !f.endsWith('.rollback.sql'))
    .sort();

  const pending = files.filter((f) => !applied.has(f));

  if (pending.length === 0) {
    console.log('No pending migrations.');
    return;
  }

  for (const filename of pending) {
    const sqlText = readFileSync(resolve(migrationsDir, filename), 'utf-8').trim();

    console.log(`Applying migration: ${filename}`);

    await db.transaction(async (tx) => {
      await tx.execute(sql.raw(sqlText));
      await tx.execute(
        sql`INSERT INTO schema_migrations (filename) VALUES (${filename})`,
      );
    });

    console.log(`  done: ${filename}`);
  }

  console.log(`Applied ${pending.length} migration(s).`);
}

runMigrations().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
