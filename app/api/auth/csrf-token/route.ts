// Imports
import { NextResponse } from 'next/server'
import crypto from 'crypto'

/**
 * Handles GET request to generate a CSRF token.
 * Returns the token in both a cookie and the response body.
 */
export async function GET() {
  // Generate a secure CSRF token
  const csrfToken = crypto.randomUUID() // Alternative: crypto.randomBytes(32).toString('hex')

  // Create JSON response with the CSRF token
  const response = NextResponse.json({ csrfToken })

  // Set the CSRF token as a cookie for client-side access
  response.cookies.set('csrfToken', csrfToken, {
    httpOnly: false, // Must be accessible by client-side JavaScript
    secure: process.env.NODE_ENV === 'production', // Only use HTTPS in production
    sameSite: 'strict', // Prevents CSRF on cross-site requests
    path: '/', // Cookie available throughout the app
    maxAge: 300, // Expires in 5 minutes
  })

  return response
}
