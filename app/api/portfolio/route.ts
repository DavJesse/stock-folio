import { NextRequest, NextResponse } from 'next/server'
import { getUserFromSessionCookie } from '@/lib/security/get-user-from-session-cookie'
import db from '@/lib/db'

// GET /api/portfolio
// Fetches the portfolio for the currently authenticated user
export async function GET(req: NextRequest) {
  // Get user from session cookie
  const user = await getUserFromSessionCookie(req)

  // If no valid session or user not found, return 401 Unauthorized
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Query the portfolio for the authenticated user
    const portfolio = db.prepare(`
      SELECT symbol, quantity, average_price AS initialPrice
      FROM portfolio
      WHERE user_id = ?
    `).all(user.userId)

    // Respond with the portfolio data
    return NextResponse.json(portfolio)
  } catch (err) {
    // Log error and return 500 Internal Server Error
    console.error('Failed to fetch portfolio:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
