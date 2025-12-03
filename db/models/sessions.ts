import db from '@/lib/db';
import { randomUUID } from 'crypto';

const SESSION_DURATION_DAYS = 1;

/**
 * Creates a new session for a given user.
 * Returns the generated session ID.
 */
export async function createSession(userId: number): Promise<string> {
  const sessionId = randomUUID();

  await db.execute({
    sql: `
      INSERT INTO sessions (id, user_id, expires_at)
      VALUES (?, ?, datetime('now', '+${SESSION_DURATION_DAYS} days'))
    `,
    args: [sessionId, userId],
  });

  return sessionId;
}

/**
 * Gets the user ID associated with a session ID.
 * Returns undefined if not found or expired.
 */
export async function getUserIdFromSession(
  sessionId: string
): Promise<number | undefined> {
  const result = await db.execute({
    sql: `
      SELECT user_id FROM sessions
      WHERE id = ? AND expires_at > datetime('now')
    `,
    args: [sessionId],
  });

  const row = result.rows[0] as unknown as { user_id: number } | undefined;
  return row?.user_id;
}

/**
 * Deletes a session from the database.
 */
export async function deleteSession(sessionId: string): Promise<void> {
  await db.execute({
    sql: `DELETE FROM sessions WHERE id = ?`,
    args: [sessionId],
  });
}

/**
 * Removes expired sessions from the database.
 */
export async function cleanupExpiredSessions(): Promise<void> {
  await db.execute({
    sql: `DELETE FROM sessions WHERE expires_at <= datetime('now')`,
  });
}
