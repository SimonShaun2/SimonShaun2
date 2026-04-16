import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema/index.js';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL && process.env.NODE_ENV === 'production') {
  throw new Error('DATABASE_URL is required in production');
}

const connectionString =
  DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/trayloop';

const url = new URL(connectionString);
const hostname = url.hostname;
const port = url.port || '5432';
const username = decodeURIComponent(url.username);
const password = decodeURIComponent(url.password);
const database = url.pathname.slice(1);

const isSupabase =
  hostname.endsWith('.supabase.co') ||
  hostname.endsWith('.pooler.supabase.com');

const hasExplicitSsl =
  url.searchParams.has('sslmode') || url.searchParams.has('ssl');

const isTransactionPooler = port === '6543';

const client = postgres({
  host: hostname,
  port: Number(port),
  username,
  password,
  database,
  ssl: isSupabase || hasExplicitSsl ? 'require' : undefined,
  prepare: isTransactionPooler ? false : true,
});

export const db = drizzle(client, { schema });
export type Database = typeof db;
