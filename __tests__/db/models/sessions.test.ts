import db from '@/lib/db'
import { createSession, getUserIdFromSession, deleteSession } from '@/db/models/sessions'
import deleteUserByUserId from '@/lib/test-helpers/delete-user-by-id'
import { randomUUID } from 'crypto'
import { insertUser } from '@/db/models/users'

describe('session model', () => {
  const testUserId = 8888
  const user = {
    id: testUserId,
    email: 'test-session@example.com',
    password_hash: 'hashed_pw',
    first_name: 'John',
    last_name: 'Doe',
    image: '',
    created_at: new Date().toISOString(),
  }

  beforeEach(() => {
    // Clean up any lingering data
    deleteUserByUserId(testUserId)

    // Insert a test user
    insertUser(user)
  })

  afterEach(() => {
    // Clean everything after each test
    deleteUserByUserId(testUserId)
  })

  it('createSession should insert a new session and return sessionId', () => {
    const sessionId = createSession(testUserId)

    // Verify it was inserted in DB
    const row = db
      .prepare('SELECT * FROM sessions WHERE id = ?')
      .get(sessionId) as { id: string; user_id: number; created_at: string; expires_at: string }

    expect(row).toBeDefined()
    expect(row.user_id).toBe(testUserId)
  })

  it('getUserIdFromSession should return the correct user_id', async () => {
    const sessionId = createSession(testUserId)

    const result = await getUserIdFromSession(sessionId)
    expect(result).toBe(testUserId)
  })

  it('getUserIdFromSession should return undefined for expired session', async () => {
    const sessionId = randomUUID()
  
    // Insert expired session manually
    db.prepare(`
      INSERT INTO sessions (id, user_id, created_at, expires_at)
      VALUES (?, ?, datetime('now'), datetime('now', '-1 day'))
    `).run(sessionId, testUserId)
    
    const result = await getUserIdFromSession(sessionId)
    expect(result).toBeUndefined()
  })

  it('deleteSession should remove the session', () => {
    const sessionId = createSession(testUserId)

    // Confirm exists before deletion
    const before = db.prepare('SELECT id FROM sessions WHERE id = ?').get(sessionId)
    expect(before).toBeDefined()

    deleteSession(sessionId)

    const after = db.prepare('SELECT id FROM sessions WHERE id = ?').get(sessionId)
    expect(after).toBeUndefined()
  })
})
