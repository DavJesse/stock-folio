import fs from 'fs';
import path from 'path';
import Database from 'better-sqlite3';

// Use process.cwd() to ensure we reference the root project directory
const migrationsDir = path.resolve(process.cwd(), 'db/migrations');
const dbPath = path.resolve(process.cwd(), 'db/db.sqlite');

// Connect to the SQLite database
const db = new Database(dbPath);

// Enable foreign key constraints
db.pragma('foreign_keys = ON');

// Read and sort migration files
const migrationFiles = fs
  .readdirSync(migrationsDir)
  .filter((file) => file.endsWith('.sql'))
  .sort(); // Ensures 001, 002, 003 order

for (const file of migrationFiles) {
  const fullPath = path.join(migrationsDir, file);
  const sql = fs.readFileSync(fullPath, 'utf8');
  try {
    db.exec(sql);
    console.log(`Applied migration: ${file}`);
  } catch (err) {
    console.error(`Failed to apply migration: ${file}`);
    console.error(err);
    process.exit(1);
  }
}

console.log('All migrations applied successfully.');

export default db;
