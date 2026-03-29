import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema/index.js';

const DATABASE_URL = process.env.DATABASE_URL && process.env.DATABASE_URL.length > 10
  ? process.env.DATABASE_URL
  : 'postgresql://postgres:postgres@localhost:5432/trayloop';

const client = postgres(DATABASE_URL, {
  ssl: DATABASE_URL.includes('supabase') ? { rejectUnauthorized: false } : undefined,
});
export const db = drizzle(client, { schema });
export type Database = typeof db;
