// External dependencies
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

// Internal database query
import { findUserByEmail } from '@/lib/queries/users/users'

// Fallback secret for JWT — ensure this is overridden in production via .env
const SECRET = process.env.JWT_SECRET || 'default_secret'

/**
 * Handles user login by validating credentials and returning a signed JWT on success.
 *
 * @param email - User's email address
 * @param password - Plain-text password provided by user
 * @returns An object with status, message, and optionally a token
 */
export async function handleLogin(email: string, password: string) {
  // Return early if any required field is missing
  if (!email || !password) {
    return { status: 400, message: 'Email and password are required.' }
  }

  // Validate email format using regex
  const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/
  if (!emailRegex.test(email)) {
    return { status: 400, message: 'Please enter a valid email address.' }
  }

  // Look up the user in the database
  const user = await findUserByEmail(email)
  if (!user) {
    return { status: 401, message: 'Invalid credentials.' }
  }

  // Compare the submitted password with the hashed password from the DB
  const isMatch = await bcrypt.compare(password, user.password_hash)
  if (!isMatch) {
    return { status: 401, message: 'Invalid credentials.' }
  }

  // Generate JWT token with a 1-hour expiration
  const token = jwt.sign({ id: user.id, email: user.email }, SECRET, {
    expiresIn: '1h',
  })

  return {
    status: 200,
    message: 'Login successful.',
    token,
  }
}
