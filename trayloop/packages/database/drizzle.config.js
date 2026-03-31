/** @type {import('drizzle-kit').Config} */
const databaseUrl = process.env.DATABASE_URL;

module.exports = {
  schema: './src/schema/index.ts',
  out: './src/migrations',
  dialect: 'postgresql',
  dbCredentials: databaseUrl
    ? { url: databaseUrl }
    : {
        host: 'localhost',
        port: 5432,
        user: 'postgres',
        password: 'postgres',
        database: 'trayloop',
      },
};
