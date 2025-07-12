import db from '../../lib/db';
import { runMigration } from '../../lib/migrate';

describe('Database migration', () => {
    // Path to the migration SQL file for creating the users table
    const migrationPath = 'db/migrations/001_create_users_table.sql';

    beforeAll(() => {
        // Ensure the migration runs before any tests execute
        runMigration(migrationPath);
    });

    it('should create the users table', () => {
        // Query sqlite_master to verify the users table was created by the migration
        const result = db
            .prepare(
                `SELECT name FROM sqlite_master WHERE type='table' AND name='users'`
            )
            .get();

        // Confirm the table exists in the database schema
        expect(result).toBeDefined();
        expect((result as { name: string }).name).toBe('users');
    });
});
