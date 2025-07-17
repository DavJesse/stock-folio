import { NextResponse } from 'next/server'

/**
 * POST /api/auth/logout
 * Clears the auth token cookie to log the user out.
 */
export async function POST() {
  const response = new NextResponse(JSON.stringify({ message: 'Logged out successfully.' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })


  // Clear the token cookie
  response.cookies.set('token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: new Date(0), // Expire immediately
  })

  return response
}
