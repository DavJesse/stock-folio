import fs from 'fs';
import path from 'path';
import { createClient } from '@libsql/client';
import 'dotenv/config'; // <-- loads .env into process.env

// Load env variables
const url = process.env.DATABASE_URI!;
const authToken = process.env.DATABASE_API_TOKEN!;

const migrationsDir = path.resolve(process.cwd(), 'db/migrations');

// Turso client
const db = createClient({
  url,
  authToken,
});

async function runMigrations() {
  const migrationFiles = fs
    .readdirSync(migrationsDir)
    .filter((file) => file.endsWith('.sql'))
    .sort(); // Ensures 001, 002, 003 order

  for (const file of migrationFiles) {
    const fullPath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(fullPath, 'utf8');

    try {
      await db.execute(sql);
      console.log(`Applied migration: ${file}`);
    } catch (err) {
      console.error(`Failed to apply migration: ${file}`);
      console.error(err);
      process.exit(1);
    }
  }

  console.log('All migrations applied successfully.');
}

runMigrations();
