import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema/index.js';

const DATABASE_URL = process.env.DATABASE_URL && process.env.DATABASE_URL.length > 10
  ? process.env.DATABASE_URL
  : 'postgresql://postgres:postgres@localhost:5432/trayloop';

const isRemote = !DATABASE_URL.includes('localhost') && !DATABASE_URL.includes('127.0.0.1');

const client = postgres(DATABASE_URL, {
  ssl: isRemote ? { rejectUnauthorized: false } : false,
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
});

export const db = drizzle(client, { schema });
export type Database = typeof db;
