import bcrypt from 'bcrypt';
import { NextRequest } from 'next/server';
import { ReadableStream } from 'node:stream/web'; // Required for Blob in Node.js test env
import db from '@/lib/db';
import { POST as handler } from '@/app/api/auth/signup/route';

// Utility to simulate NextRequest from body
// This allows us to test API routes as if they were receiving real HTTP requests.
function createNextRequest(body: Record<string, any>): NextRequest {
    const json = JSON.stringify(body);
    const blob = new Blob([json], { type: 'application/json' });

    return new NextRequest('http://localhost/api/auth/signup', {
        method: 'POST',
        body: blob,
        headers: {
            'Content-Type': 'application/json',
        },
    });
}

describe('POST /api/auth/signup', () => {
    beforeEach(() => {
        // Ensure a clean slate for each test by clearing the users table.
        db.prepare('DELETE FROM users').run();
    });

    it('should return 201 when a new user is successfully registered', async () => {
        const req = createNextRequest({
            email: 'test@example.com',
            password: 'securePass123',
        });

        const res = await handler(req);

        expect(res.status).toBe(201);
        const data = await res.json();
        expect(data.message).toBe('User created');

        // Verify user was actually inserted into the database.
        const user = db
            .prepare('SELECT * FROM users WHERE email = ?')
            .get('test@example.com') as {
                email: string;
                password_hash: string;
                created_at: string;
            } | undefined;

        expect(user).toBeDefined();
        expect(user!.email).toBe('test@example.com');
    });

    it('should return 400 when email or password is missing', async () => {
        // Intentionally passing empty strings to simulate missing fields.
        const req = createNextRequest({ email: '', password: '' });

        const res = await handler(req);

        expect(res.status).toBe(400);
        const data = await res.json();
        expect(data.error).toBeDefined();
    });

    it('should return 409 when user already exists', async () => {
        // Seed DB with a user to trigger conflict scenario.
        db.prepare(
            'INSERT INTO users (email, password_hash, created_at) VALUES (?, ?, datetime("now"))'
        ).run('test@example.com', 'hashedpassword');

        const req = createNextRequest({
            email: 'test@example.com',
            password: 'anotherPassword',
        });

        const res = await handler(req);

        expect(res.status).toBe(409);
        const data = await res.json();
        expect(data.error).toMatch(/already exists/i);
    });

    it('should hash the password before storing', async () => {
        const plainPassword = 'securePass123';

        const req = createNextRequest({
            email: 'hashcheck@example.com',
            password: plainPassword,
        });

        const res = await handler(req);
        expect(res.status).toBe(201);

        // Retrieve the user to check password hashing.
        const user = db
            .prepare('SELECT * FROM users WHERE email = ?')
            .get('hashcheck@example.com') as {
                email: string;
                password_hash: string;
                created_at: string;
            };

        expect(user).toBeDefined();
        expect(user.password_hash).not.toBe(plainPassword);

        // Ensure the stored hash matches the original password.
        const isMatch = await bcrypt.compare(plainPassword, user.password_hash);
        expect(isMatch).toBe(true);
    });
});
