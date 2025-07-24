import jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'

const JWT_SECRET = process.env.JWT_SECRET as string

/**
 * Verifies the JWT token from the incoming request cookies.
 * 
 * @param req - The incoming Next.js request object
 * @returns The decoded token containing `userId` if valid, or `null` if invalid or missing
 */
export async function verifyTokenFromRequest(req: NextRequest): Promise<{ userId: number } | null> {
  // Retrieve the token from cookies
  const token = req.cookies.get('token')?.value
  if (!token) return null

  try {
    // Verify and decode the token using the secret
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number }
    return decoded
  } catch (err) {
    // Log and return null if the token is invalid or verification fails
    console.error('Invalid token:', err)
    return null
  }
}
