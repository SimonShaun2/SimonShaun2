import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema/index.js';

const DEFAULT_URL = 'postgresql://postgres:postgres@localhost:5432/trayloop';
const connectionString = process.env.DATABASE_URL && process.env.DATABASE_URL.length > 0
  ? process.env.DATABASE_URL
  : DEFAULT_URL;

const client = postgres(connectionString);
export const db = drizzle(client, { schema });
export type Database = typeof db;
