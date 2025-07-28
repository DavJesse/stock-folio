import db from '@/lib/db'
import bcrypt from 'bcrypt'
import { handleSignup } from '@/lib/handlers/signup'
import { User } from '@/types/user'
import deleteTestUserByEmail from '@/lib/test-helpers/delete-test-user'

// Mock cookies to isolate test environment from Next.js internals
jest.mock('next/headers', () => ({
  cookies: jest.fn(() => ({
    set: jest.fn(),
  })),
}))

describe('handleSignup', () => {
  // Set JWT secret and clean up any test users before each test
  beforeEach(() => {
    process.env.JWT_SECRET = 'test-secret'
    deleteTestUserByEmail('test@example.com')
    deleteTestUserByEmail('hashcheck@example.com')
  })

  // Clean up env and test users after each test
  afterEach(() => {
    delete process.env.JWT_SECRET
    deleteTestUserByEmail('test@example.com')
    deleteTestUserByEmail('hashcheck@example.com')
  })

  it('should return 201 when a new user is successfully registered', async () => {
    const res = await handleSignup({
      email: 'test@example.com',
      password: 'secureP@ss123',
    })

    const body = res.body as {
      userId: number
      message: string
      demoMessage: string
    }

    expect(res.status).toBe(201)
    expect(res.body).toHaveProperty('message', 'User created')
    expect(res.body).toHaveProperty(
      'demoMessage',
      'You have unlocked your demo account and have been awarded $10,000.'
    )
    expect(res.body).toHaveProperty('userId')
    expect(typeof body.userId).toBe('number')

    // Validate user was inserted into the DB
    const user = db
      .prepare('SELECT * FROM users WHERE email = ?')
      .get('test@example.com') as User

    expect(user).toBeDefined()
    expect(user.email).toBe('test@example.com')
  })

  it('should return 400 when email or password is missing', async () => {
    const res = await handleSignup({
      email: '',
      password: '',
    })

    expect(res.status).toBe(400)
    expect(res.body).toEqual({
      error: 'Email and password are required.',
    })
  })

  it('should return 409 when user already exists', async () => {
    deleteTestUserByEmail('test@example.com')

    // Manually insert a user to simulate existing account
    db.prepare(
      `INSERT INTO users (email, password_hash, created_at)
       VALUES (?, ?, datetime('now', 'localtime'))`
    ).run('test@example.com', 'somehash')

    const res = await handleSignup({
      email: 'test@example.com',
      password: 'secureP@ss123',
    })

    expect(res.status).toBe(409)
    expect(res.body).toEqual({
      error: 'User already exists.',
    })
  })

  it('should hash the password before storing', async () => {
    const plainPassword = 'secureP@ss123'

    const res = await handleSignup({
      email: 'hashcheck@example.com',
      password: plainPassword,
    })

    expect(res.status).toBe(201)

    const user = db
      .prepare('SELECT * FROM users WHERE email = ?')
      .get('hashcheck@example.com') as User

    // Password should not be stored in plain text
    expect(user).toBeDefined()
    expect(user.password_hash).not.toBe(plainPassword)

    const isMatch = await bcrypt.compare(plainPassword, user.password_hash)
    expect(isMatch).toBe(true)
  })
})
