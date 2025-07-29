import { NextRequest, NextResponse } from 'next/server'
import { getUserFromSessionCookie } from '@/lib/security/get-user-from-session-cookie'
import db from '@/lib/db'

// Structure of a single transaction row returned from the database
type TransactionRow = {
  symbol: string             // Stock symbol (e.g., AAPL, MSFT)
  type: 'buy' | 'sell'       // Transaction type: 'buy' or 'sell'
  quantity: number           // Number of shares involved in the transaction
  price: number              // Price per share at time of transaction
  created_at: string         // Timestamp when transaction occurred
}

// GET /api/transactions/history
// Retrieves paginated list of transactions for the logged-in user
export async function GET(req: NextRequest) {
  // Authenticate user using session cookie
  const user = await getUserFromSessionCookie(req)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Parse optional query parameters for pagination
  const { searchParams } = new URL(req.url)
  const parsedLimit = parseInt(searchParams.get('limit') || '', 10)
  const parsedOffset = parseInt(searchParams.get('offset') || '', 10)

  const limit = Number.isNaN(parsedLimit) ? 10 : parsedLimit   // Default: 10 records
  const offset = Number.isNaN(parsedOffset) ? 0 : parsedOffset // Default: start from 0

  // SQL statement to retrieve transaction history for the user
  const stmt = db.prepare(`
    SELECT symbol, type, quantity, price, created_at
    FROM transactions
    WHERE user_id = ?
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `)

  // SQL statement to get total number of transactions for pagination metadata
  const countStmt = db.prepare(`
    SELECT COUNT(*) as total
    FROM transactions
    WHERE user_id = ?
  `)

  // Execute both queries
  const { total } = countStmt.get(user.userId) as { total: number }
  const transactions = stmt.all(user.userId, limit, offset) as unknown as TransactionRow[]

  // Return the paginated transaction history along with the total count
  return NextResponse.json({ transactions, total })
}
