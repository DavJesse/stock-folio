// Initializes the database by executing the users table migration.
// Usage: Run this script to set up the initial database schema.

import db from '../lib/db';
import { readFileSync } from 'fs';

// Read the SQL schema for creating the users table
const schema = readFileSync('db/migrations/001_create_users_table.sql', 'utf8');

// Execute the schema on the database
db.exec(schema);

console.log('Database initialized');
