import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'


/**
 * setSessionCookie
 * 
 * Creates and sets a secure JWT session cookie for the user.
 * - Signs a token using the user ID.
 * - Stores the token in an HTTP-only cookie.
*
* @param id - User ID to encode in the JWT
*/
export async function setSessionCookie(id: string) {
  const secret = process.env.JWT_SECRET as string

  if (!secret) {
    throw new Error('Missing JWT_SECRET')
  }
  // Generate JWT token valid for 1 day
  const token = jwt.sign({ id }, secret, {
    algorithm: 'HS256',
    expiresIn: '1d',
  })

  // Get the cookie store and set the session cookie
  const cookieStore = await cookies()
  cookieStore.set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24, // 1 day in seconds
  })
}
