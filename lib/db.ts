// Initialize and export a singleton SQLite database connection using better-sqlite3

import Database from 'better-sqlite3';

// Create a new database connection to the specified SQLite file
const db = new Database('db/db.sqlite');

// Export the database connection for use in other modules
export default db;
