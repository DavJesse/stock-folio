import db from '@/lib/db'

export interface Holding {
  id: number
  user_id: number
  symbol: string
  quantity: number
  average_price: number
}

/**
 * Retrieves a specific holding for a user based on stock symbol.
 * Returns `undefined` if no holding exists.
 */
export async function getHolding(userId: number, symbol: string): Promise<Holding | undefined> {
  return db
    .prepare('SELECT * FROM portfolio WHERE user_id = ? AND symbol = ?')
    .get(userId, symbol) as Holding | undefined
}

/**
 * Inserts a new holding into the portfolio for the given user.
 */
export async function insertHolding(
  userId: number,
  symbol: string,
  quantity: number,
  avgPrice: number
): Promise<void> {
  db.prepare(
    `INSERT INTO portfolio (user_id, symbol, quantity, average_price)
     VALUES (?, ?, ?, ?)`
  ).run(userId, symbol, quantity, avgPrice)
}

/**
 * Updates both the quantity and average price for an existing holding.
 * Also sets `updated_at` to the current timestamp.
 */
export async function updateHoldingQuantityAndPrice(
  userId: number,
  symbol: string,
  newQuantity: number,
  newAvgPrice: number
): Promise<void> {
  db.prepare(
    `UPDATE portfolio
     SET quantity = ?, average_price = ?, updated_at = CURRENT_TIMESTAMP
     WHERE user_id = ? AND symbol = ?`
  ).run(newQuantity, newAvgPrice, userId, symbol)
}

/**
 * Deletes a holding from the portfolio based on user and symbol.
 */
export async function deleteHolding(userId: number, symbol: string): Promise<void> {
  db.prepare(
    `DELETE FROM portfolio
     WHERE user_id = ? AND symbol = ?`
  ).run(userId, symbol)
}
