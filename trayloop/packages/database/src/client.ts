import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema/index.js';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL && process.env.NODE_ENV === 'production') {
  throw new Error('DATABASE_URL is required in production');
}

const connectionString = DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/trayloop';
const isLocal = connectionString.includes('localhost') || connectionString.includes('127.0.0.1');

const client = postgres(connectionString, {
  ssl: isLocal ? false : true,
});

export const db = drizzle(client, { schema });
export type Database = typeof db;
