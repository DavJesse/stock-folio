import db from '@/lib/db'
import { randomUUID } from 'crypto'

const SESSION_DURATION_DAYS = 1

/**
 * Creates a new session for a given user.
 * Returns the generated session ID.
 */
export function createSession(userId: number): string {
  const sessionId = randomUUID()

  db.prepare(`
    INSERT INTO sessions (id, user_id, expires_at)
    VALUES (?, ?, datetime('now', '+${SESSION_DURATION_DAYS} days'))
  `).run(sessionId, userId)

  return sessionId
}

/**
 * Gets the user ID associated with a session ID.
 * Returns undefined if not found or expired.
 */
export async function getUserIdFromSession(sessionId: string): Promise<number | undefined> {
  const row = db.prepare(`
    SELECT user_id FROM sessions
    WHERE id = ? AND expires_at > datetime('now')
  `).get(sessionId) as { user_id: number } | undefined

  return row?.user_id
}

/**
 * Deletes a session from the database.
 */
export async function deleteSession(sessionId: string): Promise<void> {
  db.prepare(`DELETE FROM sessions WHERE id = ?`).run(sessionId)
}

/**
 * Optional: Removes expired sessions from the database.
 */
export function cleanupExpiredSessions(): void {
  db.prepare(`DELETE FROM sessions WHERE expires_at <= datetime('now')`).run()
}
