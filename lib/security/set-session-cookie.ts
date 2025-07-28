import { cookies } from 'next/headers'

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

  // Get the cookie store and set the session cookie
  const cookieStore = await cookies()
  cookieStore.set('token', id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24, // 1 day in seconds
  })
}
