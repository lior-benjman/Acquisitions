import 'dotenv/config.js';

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { drizzle as drizzlePostgres } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

const isDevelopment = process.env.NODE_ENV === 'development';
const databaseUrl = process.env.DATABASE_URL;

let db;
let sql;

if (isDevelopment && databaseUrl.includes('neon-local')) {
  // Use regular postgres connection for Neon Local in development
  sql = postgres(databaseUrl, {
    ssl: false, // Neon Local doesn't require SSL verification
    max: 10,
  });
  db = drizzlePostgres(sql);
} else {
  // Use Neon serverless driver for production or cloud Neon
  sql = neon(databaseUrl);
  db = drizzle(sql);
}

export { db, sql };
