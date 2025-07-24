import db from '@/lib/db'

/**
 * Represents a single buy or sell transaction for a user's portfolio.
 */
type Transaction = {
  user_id: number
  type: 'buy' | 'sell'
  symbol: string
  quantity: number
  price: number
  created_at: Date
}

/**
 * Inserts a transaction record into the database.
 */
export async function insertTransaction(tx: Transaction): Promise<void> {
  db.prepare(
    `INSERT INTO transactions (
      user_id, type, symbol, quantity, price, created_at
    ) VALUES (?, ?, ?, ?, ?, ?)`
  ).run(
    tx.user_id,
    tx.type,
    tx.symbol,
    tx.quantity,
    tx.price,
    tx.created_at.toISOString() // Store as ISO timestamp
  )
}
