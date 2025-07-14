import db from '@/lib/db';
import bcrypt from 'bcrypt';
import { handleSignup } from '@/lib/handlers/signup';
import { User } from '@/types/user';

// Clear the users table before each test to ensure isolation
beforeEach(() => {
  db.prepare('DELETE FROM users').run();
});

describe('handleSignup', () => {
  it('should return 201 when a new user is successfully registered', async () => {
    const res = await handleSignup({
      email: 'test@example.com',
      password: 'securePass123',
    });

    expect(res.status).toBe(201);
    expect(res.body).toEqual({ message: 'User created' });

    // Check that the user was actually inserted into the database
    const user = db
      .prepare('SELECT * FROM users WHERE email = ?')
      .get('test@example.com') as User;

    expect(user).toBeDefined();
    expect(user.email).toBe('test@example.com');
  });

  it('should return 400 when email or password is missing', async () => {
    // Provide empty fields to simulate bad input
    const res = await handleSignup({
      email: '',
      password: '',
    });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'Email and password are required.' });
  });

  it('should return 409 when user already exists', async () => {
    // Seed the database with an existing user to trigger a conflict
    db.prepare(
      'INSERT INTO users (email, password_hash, created_at) VALUES (?, ?, datetime(\'now\', \'localtime\'))'
    ).run('test@example.com', 'somehash');

    const res = await handleSignup({
      email: 'test@example.com',
      password: 'anything',
    });

    expect(res.status).toBe(409);
    expect(res.body).toEqual({ error: 'User already exists.' });
  });

  it('should hash the password before storing', async () => {
    const plainPassword = 'securePass123';

    const res = await handleSignup({
      email: 'hashcheck@example.com',
      password: plainPassword,
    });

    expect(res.status).toBe(201);

    // Fetch the user and validate that the stored password is hashed
    const user = db
      .prepare('SELECT * FROM users WHERE email = ?')
      .get('hashcheck@example.com') as User;

    expect(user).toBeDefined();
    expect(user.password_hash).not.toBe(plainPassword);

    // Ensure the hashed password matches the original plain password
    const isMatch = await bcrypt.compare(plainPassword, user.password_hash);
    expect(isMatch).toBe(true);
  });
});
