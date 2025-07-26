// lib/security/validate-csrf.ts
import { NextRequest } from 'next/server'

/**
 * Validates CSRF token by comparing the token in the request header
 * with the token stored in the request cookies.
 *
 * @param req - Incoming Next.js request
 * @returns true if tokens exist and match, false otherwise
 */
export async function validateCsrf(req: NextRequest): Promise<boolean> {
  const cookieToken = req.cookies.get('csrfToken')?.value
  // Try both cases to be safe
  const headerToken = req.headers.get('X-CSRF-Token') || req.headers.get('x-csrf-token')

  // Tokens must exist and match
  return !!cookieToken && !!headerToken && cookieToken === headerToken
}