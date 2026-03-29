import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema/index.js';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL && process.env.NODE_ENV === 'production') {
  throw new Error('DATABASE_URL is required in production');
}

const connectionString = DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/trayloop';

const client = postgres(connectionString);

export const db = drizzle(client, { schema });
export type Database = typeof db;
