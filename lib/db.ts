import Database from 'better-sqlite3';
import path from 'path';

// Resolve the path to the SQLite database file
const dbPath = path.resolve(process.cwd(), 'db/db.sqlite');

// Create a persistent database connection
const db = new Database(dbPath);

// Enable foreign key constraint enforcement
db.pragma('foreign_keys = ON');

// Export the database instance for use across the application
export default db;
