import db from '@/lib/db'
import bcrypt from 'bcrypt'
import { setSessionCookie } from '@/lib/security/set-session-cookie'
import { createSession } from '@/db/models/sessions'
import isStrongPassword from '../passwords/is-strong-password'

type SignupPayload = {
  email: string
  password: string
  first_name: string
  last_name: string
  image: string
}

export async function handleSignup(
  payload: SignupPayload
): Promise<{ status: number; body: object }> {
  const { email, password, first_name, last_name, image } = payload
  const sanitizedImage = image ?? ''
  const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/;

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
    return {
      status: 400,
      body: { error: 'All fields, except profile image, are required.' },
    }
  }

  // Validate field lengths for irregularities
  if (email.length > 255 || first_name.length > 100 || last_name.length > 100) {
    return {
      status: 400,
      body: { error: 'Input too long.' },
    }
  }

  // Check email format
  if (!emailRegex.test(email)) {
    return {
      status: 400,
      body: { error: 'Invalid email format.' },
    }
  }

  // Check password strength
  if (!isStrongPassword(password)) {
    return {
      status: 400,
      body: {
        error:
          'Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.',
      },
    }
  }

  // Check image file length
  if (sanitizedImage && sanitizedImage.length > 500) {
    return {
      status: 400,
      body: { error: 'Image URL too long.' },
    }
  }

  const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email)
  if (existingUser) {
    return {
      status: 409,
      body: { error: 'User already exists.' },
    }
  }

  const passwordHash = await bcrypt.hash(password, 10)

  let userId: number | undefined

  try {
    const insertUserStmt = db.prepare(`
      INSERT INTO users (email, password_hash, first_name, last_name, image, created_at)
      VALUES (?, ?, ?, ?, ?, datetime('now', 'localtime'))
    `)

    const insertAccountStmt = db.prepare(`
      INSERT INTO accounts (user_id, cash_balance, created_at, updated_at)
      VALUES (?, ?, datetime('now', 'localtime'), datetime('now', 'localtime'))
    `)

    const insertTransactionStmt = db.prepare(`
      INSERT INTO transactions (user_id, symbol, quantity, price, type, created_at)
      VALUES (?, ?, ?, ?, ?, datetime('now', 'localtime'))
    `)

    const transaction = db.transaction(() => {
      const userResult = insertUserStmt.run(email, passwordHash, first_name, last_name, sanitizedImage)
      userId = userResult.lastInsertRowid as number
      
      insertAccountStmt.run(userId, 10_000)

      // Insert initial $10,000 deposit into transactions table
      insertTransactionStmt.run(userId, 'CASH', 1, 10000, 'deposit')
    })

    transaction()

    if (userId === undefined) {
      return {
        status: 500,
        body: { error: 'User ID was not set after signup.' },
      }
    }

    // Log session to database
    const sessionId = createSession(userId)

    // Set session cookie for the new user
    await setSessionCookie(sessionId)

    return {
      status: 201,
      body: {
        message: 'User created',
        userId,
        demoMessage: 'You have unlocked your demo account and have been awarded $10,000.',
      },
    }
  } catch (err) {
    if (process.env.LOG_ERRORS === 'true') {
      console.error('Signup transaction failed:', err)
    }
    
    return {
      status: 500,
      body: { error: 'Failed to create account' },
    }
  }
}
