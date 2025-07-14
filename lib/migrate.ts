import { readFileSync } from 'fs'; // Node.js file system module for reading migration files
import db from './db';

/**
 * Runs a database migration by executing the SQL schema from the specified file.
 * @param path - Absolute or relative path to the migration SQL file.
 */
export function runMigration(path: string) {
    // Read the SQL schema from the migration file as a UTF-8 string
    const schema = readFileSync(path, 'utf8');

    // Execute the schema against the database connection
    db.exec(schema);
}
