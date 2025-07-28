import { NextRequest, NextResponse } from 'next/server'
import { getUserFromSessionCookie } from '@/lib/security/get-user-from-session-cookie'
import { validateCsrf } from '@/lib/security/validate-csrf'
import { buyStock } from '@/lib/transactions/buy'

/**
 * Handles POST requests for buying a stock.
 * 
 * Validates the CSRF token, checks user authentication, validates request body,
 * and then executes the buy transaction.
 */
export async function POST(req: NextRequest) {
  // Step 1: Validate CSRF token
  if (!(await validateCsrf(req))) {
    return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 })
  }

  // Step 2: Authenticate user via token
  const user = await getUserFromSessionCookie(req)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Step 3: Parse and validate JSON request body
  let body
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { symbol, quantity, price } = body

  // Ensure all required fields are present and valid
  if (!symbol || typeof quantity !== 'number' || typeof price !== 'number') {
    return NextResponse.json({ error: 'Missing or invalid parameters' }, { status: 400 })
  }

  // Step 4: Execute stock purchase logic
  try {
    const result = await buyStock(user.userId, symbol, quantity, price)
    return NextResponse.json(result, { status: 200 })
  } catch (err) {
    if (err instanceof Error) {
      console.error('Buy error:', err)
      return NextResponse.json({ error: err.message }, { status: 500 })
    }

    // Fallback for unknown error types
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
