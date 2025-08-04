jest.mock('next/headers', () => ({
  cookies: () => ({
    set: jest.fn(),
    get: jest.fn(),
    delete: jest.fn(),
  }),
}));

// Mock session-related functions
jest.mock('@/lib/security/set-session-cookie', () => ({
  setSessionCookie: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@/db/models/sessions', () => ({
  createSession: jest.fn().mockReturnValue('mock-session-id'),
}));

// Fix the mock path to match your import
jest.mock('@/lib/handlers/../passwords/is-strong-password', () => ({
  __esModule: true,
  default: jest.fn().mockReturnValue(true),
}));

global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ cash_balance: 10000 }),
  })
) as jest.Mock;

import db from '@/lib/db'
import bcrypt from 'bcrypt'
import { handleSignup } from '@/lib/handlers/signup'
import { User } from '@/types/user'
import deleteTestUserByEmail from '@/lib/test-helpers/delete-test-user'
import { insertUser } from '@/db/models/users';

describe('handleSignup', () => {
  beforeEach(() => {
    process.env.JWT_SECRET = 'test-secret'
    
    // Reapply fetch mock
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ cash_balance: 10000 }),
      })
    ) as jest.Mock

    deleteTestUserByEmail('test@example.com')
    deleteTestUserByEmail('hashcheck@example.com')
  })

  afterEach(() => {
    jest.clearAllMocks()
    delete process.env.JWT_SECRET
    deleteTestUserByEmail('test@example.com')
    deleteTestUserByEmail('hashcheck@example.com')
  })

  it('should return 400 when email or password is missing', async () => {
    const res = await handleSignup({
      email: '',
      password: '',
      first_name: 'John',
      last_name: 'Doe',
      image: '',
    })

    expect(res.status).toBe(400)
    expect(res.body).toEqual({
      error: 'All fields, except profile image, are required.',
    })
  })

  it('should return 409 when user already exists', async () => {
    const user: User = {
      id: 99999,
      email: 'test@example.com',
      password_hash: 'somehash',
      first_name: 'John',
      last_name: 'Doe',
      image: '',
      created_at: new Date().toISOString()
    }
    // Manually insert a user to simulate existing account
    insertUser(user)

    const res = await handleSignup({
      email: 'test@example.com',
      password: 'secureP@ss123',
      first_name: 'John',
      last_name: 'Doe',
      image: '',
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
      first_name: 'John',
      last_name: 'Doe',
      image: '',
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
