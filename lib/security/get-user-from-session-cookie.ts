// lib/security/get-user-from-session.ts
import { getUserIdFromSession } from '@/db/models/sessions'
import { NextRequest } from 'next/server'

/**
 * Extracts and validates session cookie from a Next.js API request.
 * Returns `{ userId }` if authenticated, `undefined` otherwise.
 */
export async function getUserFromSessionCookie(req: NextRequest): Promise<{ userId: number } | undefined> {
  const sessionId = req.cookies.get('token')?.value
  if (!sessionId) return undefined

  const userId = await getUserIdFromSession(sessionId)
  if (!userId) return undefined

  return { userId }
}
