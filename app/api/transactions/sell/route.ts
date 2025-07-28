import { NextRequest, NextResponse } from 'next/server'
import { getUserFromSessionCookie } from '@/lib/security/get-user-from-session-cookie'
import { validateCsrf } from '@/lib/security/validate-csrf'
import { sellStock } from '@/lib/transactions/sell'

export async function POST(req: NextRequest) {
  // Check CSRF token validity
  if (!(await validateCsrf(req))) {
    return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 })
  }

  // Authenticate user via token
  const user = await getUserFromSessionCookie(req)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Attempt to parse JSON body
  let body
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { symbol, quantity, price } = body

  // Validate payload fields
  if (!symbol || typeof quantity !== 'number' || typeof price !== 'number') {
    return NextResponse.json({ error: 'Missing or invalid parameters' }, { status: 400 })
  }

  // Process the stock sale transaction
  try {
    const result = await sellStock(user.userId, symbol, quantity, price)
    return NextResponse.json(result, { status: 200 })
  } catch (err) {
    if (err instanceof Error) {
      console.error('Sell error:', err)
      return NextResponse.json({ error: err.message }, { status: 500 })
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
