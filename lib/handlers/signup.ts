import db from '@/lib/db';
import bcrypt from 'bcrypt';

/**
 * Defines the shape of data required for user signup.
 */
type SignupPayload = {
  email: string;
  password: string;
};

/**
 * Handles user signup logic.
 * Validates input, checks for duplicates, hashes password, and inserts user into DB.
 *
 * @param payload - An object containing the user's email and password
 * @returns A response-like object containing status and response body
 */
export async function handleSignup(
  payload: SignupPayload
): Promise<{ status: number; body: object }> {
  const { email, password } = payload;

  // Validate that email and password are non-empty strings
  if (
    typeof email !== 'string' ||
    typeof password !== 'string' ||
    email.trim() === '' ||
    password.trim() === ''
  ) {
    return {
      status: 400,
      body: { error: 'Email and password are required.' },
    };
  }

  // Check if a user with the same email already exists
  const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existingUser) {
    return {
      status: 409,
      body: { error: 'User already exists.' },
    };
  }

  // Hash the password using bcrypt with a secure salt
  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  // Insert the new user into the database with a creation timestamp
  db.prepare(
    'INSERT INTO users (email, password_hash, created_at) VALUES (?, ?, datetime(\'now\', \'localtime\'))'
  ).run(email, passwordHash);

  return {
    status: 201,
    body: { message: 'User created' },
  };
}
