import db from '@/lib/db';
import bcrypt from 'bcrypt';
import { setSessionCookie } from '@/lib/security/set-session-cookie';
import { createSession } from '@/db/models/sessions';
import isStrongPassword from '../passwords/is-strong-password';

type SignupPayload = {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  image: string;
};

export async function handleSignup(
  payload: SignupPayload
): Promise<{ status: number; body: object }> {
  const { email, password, first_name, last_name, image } = payload;
  const sanitizedImage = image ?? '';
  const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/;

  // Basic validations
  if (
    typeof email !== 'string' ||
    typeof password !== 'string' ||
    typeof first_name !== 'string' ||
    typeof last_name !== 'string' ||
    email.trim() === '' ||
    password.trim() === '' ||
    first_name.trim() === '' ||
    last_name.trim() === ''
  ) {
    return { status: 400, body: { error: 'All fields, except profile image, are required.' } };
  }

  if (email.length > 255 || first_name.length > 100 || last_name.length > 100) {
    return { status: 400, body: { error: 'Input too long.' } };
  }

  if (!emailRegex.test(email)) {
    return { status: 400, body: { error: 'Invalid email format.' } };
  }

  if (!isStrongPassword(password)) {
    return {
      status: 400,
      body: {
        error:
          'Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.',
      },
    };
  }

  if (sanitizedImage && sanitizedImage.length > 500) {
    return { status: 400, body: { error: 'Image URL too long.' } };
  }

  // Check if user exists
  const existingUserResult = await db.execute({
    sql: 'SELECT id FROM users WHERE email = ?',
    args: [email],
  });

  if (existingUserResult.rows.length > 0) {
    return { status: 409, body: { error: 'User already exists.' } };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  let userId: number;

  try {
    // Turso does not return lastInsertRowid by default. 
    // Use RETURNING id to get it:
    const userRow = await db.execute({
      sql: `
        INSERT INTO users (email, password_hash, first_name, last_name, image, created_at)
        VALUES (?, ?, ?, ?, ?, datetime('now', 'localtime'))
        RETURNING id
      `,
      args: [email, passwordHash, first_name, last_name, sanitizedImage || null],
    });

    userId = (userRow.rows[0] as unknown as { id: number }).id;

    // Insert demo account
    await db.execute({
      sql: `
        INSERT INTO accounts (user_id, cash_balance, created_at, updated_at)
        VALUES (?, ?, datetime('now', 'localtime'), datetime('now', 'localtime'))
      `,
      args: [userId, 10000],
    });

    // Insert initial deposit transaction
    await db.execute({
      sql: `
        INSERT INTO transactions (user_id, symbol, quantity, price, type, created_at)
        VALUES (?, ?, ?, ?, ?, datetime('now', 'localtime'))
      `,
      args: [userId, 'CASH', 1, 10000, 'deposit'],
    });

    // Create session
    const sessionId = await createSession(userId);

    await setSessionCookie(sessionId);

    return {
      status: 201,
      body: {
        message: 'User created',
        userId,
        demoMessage: 'You have unlocked your demo account and have been awarded $10,000.',
      },
    };
  } catch (err) {
    if (process.env.LOG_ERRORS === 'true') console.error('Signup failed:', err);

    return { status: 500, body: { error: 'Failed to create account' } };
  }
}
