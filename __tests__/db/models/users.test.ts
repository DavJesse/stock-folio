import Database from 'better-sqlite3'
import { insertUser, getUserById, getPasswordlessUserById, updateUserById } from '@/db/models/users'
import { User } from '@/types/user'

// Mock the db import to use an in-memory database for isolated testing
jest.mock('@/lib/db', () => new Database(':memory:'))

import db from '@/lib/db'

// Test fixture: base user object used across test cases
const testUser: User = {
  id: 1,
  email: 'test@example.com',
  password_hash: 'hashed_password',
  first_name: 'John',
  last_name: 'Doe',
  image: '',
  created_at: '2023-01-01',
}

beforeAll(() => {
  // Create the users table in the in-memory DB before tests run
  db.exec(`
    CREATE TABLE users (
      id INTEGER PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      image TEXT,
      created_at TEXT NOT NULL
    );
  `)
})

afterAll(() => {
  // Clean up in-memory DB after tests complete
  db.close()
})

describe('User Model Functions', () => {
  it('inserts a new user into the database', () => {
    const result = insertUser(testUser)
    expect(result.changes).toBe(1)
  })

  it('retrieves a user by ID (with password)', () => {
    const user = getUserById(1)
    expect(user).toMatchObject({
      id: 1,
      email: testUser.email,
      first_name: testUser.first_name,
      last_name: testUser.last_name,
      password_hash: testUser.password_hash,
      image: '',
      created_at: testUser.created_at,
    })
  })

  it('retrieves a user by ID without password (getPasswordlessUserById)', async () => {
    const user = await getPasswordlessUserById(1)
    expect(user).toMatchObject({
      id: 1,
      email: testUser.email,
      first_name: testUser.first_name,
      last_name: testUser.last_name,
      image: '',
      created_at: testUser.created_at,
    })
    expect(user).not.toHaveProperty('password_hash') // Ensure sensitive data is omitted
  })

  it('updates a user by ID', async () => {
    const result = await updateUserById(1, {
      first_name: 'Jane',
      last_name: 'Smith',
      email: 'jane@example.com',
      image: '/img.png',
    })
    expect(result).toBe(true)

    const updated = getUserById(1)
    expect(updated).toMatchObject({
      first_name: 'Jane',
      last_name: 'Smith',
      email: 'jane@example.com',
      image: '/img.png',
    })
  })

  it('returns false when updating non-existent user', async () => {
    const result = await updateUserById(999, {
      first_name: 'Ghost',
    })
    expect(result).toBe(false)
  })
})
