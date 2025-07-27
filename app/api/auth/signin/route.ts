import { NextRequest, NextResponse } from 'next/server'
import { handleLogin } from '@/lib/handlers/login'
import { validateCsrf } from '@/lib/security/validate-csrf'

/**
 * POST /api/login
 * Handles user login and sets HTTP-only auth token cookie.
 */
export async function POST(req: NextRequest) {
  if (!(await validateCsrf(req))) {
    return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 })
  }
  
  try {
    // Extract credentials from request body
    const { email, password } = await req.json()

    // Attempt login with provided credentials
    const result = await handleLogin(email, password)

    // If login failed, return error response
    if (result.status !== 200 || !result.sessionId) {
      return NextResponse.json({ message: result.message }, { status: result.status })
    }

    // If login successful, set secure auth cookie
    const response = NextResponse.json({ message: result.message }, { status: 200 })

    response.cookies.set('token', result.sessionId, {
      httpOnly: true, // inaccessible from client-side JavaScript
      secure: process.env.NODE_ENV === 'production', // only send over HTTPS in production
      sameSite: 'lax', // prevents CSRF in most cases
      path: '/',
      maxAge: 60 * 60, // 1 hour in seconds
    })

    return response
  } catch (err) {
    // Catch and log unexpected server errors
    console.error('Login error:', err)
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 })
  }
}
