import { NextRequest, NextResponse } from 'next/server'
import { validateCsrf } from '@/lib/security/validate-csrf'
import { deleteSession } from '@/db/models/sessions'

/**
 * POST /api/auth/logout
 * Clears the auth token cookie and deletes session from DB.
 */
export async function POST(req: NextRequest) {
  if (!(await validateCsrf(req))) {
    return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 })
  }

  const sessionId = req.cookies.get('token')?.value

  if (sessionId) {
    deleteSession(sessionId)
  }

  const response = new NextResponse(
    JSON.stringify({ message: 'Logged out successfully.' }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  )

  // Clear the token cookie
  response.cookies.set('token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: new Date(0),
  })

  return response
}
