// lib/security/get-user-from-session.ts
import { getUserIdFromSession } from '@/db/models/sessions'
import { NextRequest } from 'next/server'

/**
 * Extracts and validates session cookie from a Next.js API request.
 * Returns `{ userId }` if authenticated, `undefined` otherwise.
 */
export function getUserFromSessionCookie(req: NextRequest): { userId: number } | undefined {
  const sessionId = req.cookies.get('token')?.value
  if (!sessionId) return undefined

  const userId = getUserIdFromSession(sessionId)
  if (!userId) return undefined

  return { userId }
}
