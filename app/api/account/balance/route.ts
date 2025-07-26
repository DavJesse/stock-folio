import { getAccountByUserId } from '@/db/models/accounts'
import { verifyTokenFromRequest } from '@/lib/security/verify-token'
import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/account/balance
 *
 * Authenticated endpoint that returns the user's cash balance.
 * - Verifies the JWT from request cookies.
 * - Looks up the user's account by their ID.
 * - Returns the cash balance in JSON format.
 */
export async function GET(req: NextRequest) {
  // Verify and decode user token from the request
  const user = await verifyTokenFromRequest(req)

  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  // Retrieve the account associated with the user
  const account = await getAccountByUserId(user.userId)

  if (!account) {
    return NextResponse.json(
      { error: 'Account not found' },
      { status: 404 }
    )
  }

  // Return the user's current cash balance
  return NextResponse.json({
    cash_balance: account.cash_balance,
  })
}
