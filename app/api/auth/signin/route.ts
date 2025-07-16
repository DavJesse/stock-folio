import { NextRequest, NextResponse } from 'next/server'
import { handleLogin } from '@/lib/handlers/login'

/**
 * Handles user login requests.
 * Responds with a token and message, or error message.
 */
export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()
    const result = await handleLogin(email, password)

    return NextResponse.json(result, { status: result.status })
  } catch (err) {
    console.error('Login error:', err)
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 })
  }
}
