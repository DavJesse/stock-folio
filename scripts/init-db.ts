// Initializes the database by executing the users table migration.
// Usage: Run this script to set up the initial database schema.

import { runMigration } from '../lib/migrate';

// Run the initial migration to create the users table.
// This ensures the database schema is ready before application logic is used.
runMigration('db/migrations/001_create_users_table.sql');

console.log('Database initialized');
