import db from '../../lib/db';

// Test suite for the database connection utility
describe('Database connection (lib/db)', () => {
    // Verifies that the database instance exposes the expected API
    it('should return a valid SQLite database instance', () => {
        expect(typeof db.prepare).toBe('function');
    });

    // Checks that a simple query can be executed successfully
    it('should allow executing a simple query', () => {
        const result = db.prepare('SELECT 1 AS num').get() as { num: number };
        expect(result.num).toBe(1);
    });
});
