import Database from 'better-sqlite3';
import fs from 'fs';

/**
 * Creates an in-memory SQLite database and applies the given SQL migrations.
 *
 * @param migrationPaths - An array of file paths pointing to SQL migration files.
 * @returns A configured in-memory SQLite database instance.
 */
export function createTestDB(migrationPaths: string[]) {
  // Initialize an in-memory SQLite database
  const db = new Database(':memory:');

  // Enable foreign key constraints (off by default in SQLite)
  db.pragma('foreign_keys = ON');

  for (const path of migrationPaths) {
    // Read and apply each migration SQL file
    const sql = fs.readFileSync(path, 'utf-8');
    db.exec(sql);
  }

  return db;
}
