import db from '@/lib/db'
import bcrypt from 'bcrypt'
import { setSessionCookie } from '@/lib/security/set-session-cookie'
import { createSession } from '@/db/models/sessions'

type SignupPayload = {
  email: string
  password: string
}

export async function handleSignup(
  payload: SignupPayload
): Promise<{ status: number; body: object }> {
  const { email, password } = payload

  if (
    typeof email !== 'string' ||
    typeof password !== 'string' ||
    email.trim() === '' ||
    password.trim() === ''
  ) {
    return {
      status: 400,
      body: { error: 'Email and password are required.' },
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
      INSERT INTO users (email, password_hash, created_at)
      VALUES (?, ?, datetime('now', 'localtime'))
    `)

    const insertAccountStmt = db.prepare(`
      INSERT INTO accounts (user_id, cash_balance, created_at, updated_at)
      VALUES (?, ?, datetime('now', 'localtime'), datetime('now', 'localtime'))
    `)

    const transaction = db.transaction(() => {
      const userResult = insertUserStmt.run(email, passwordHash)
      userId = userResult.lastInsertRowid as number
      insertAccountStmt.run(userId, 10_000)
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
    console.error('Signup transaction failed:', err)
    return {
      status: 500,
      body: { error: 'Failed to create account' },
    }
  }
}
