import db from '@/lib/db';

/**
 * Represents a single buy, sell, or deposit transaction for a user's portfolio.
 */
export type Transaction = {
  user_id: number;
  type: 'buy' | 'sell' | 'deposit';
  symbol: string;
  quantity: number;
  price: number;
  created_at: Date;
};

/**
 * Inserts a transaction record into the database.
 */
export async function insertTransaction(tx: Transaction): Promise<void> {
  await db.execute({
    sql: `
      INSERT INTO transactions (
        user_id, type, symbol, quantity, price, created_at
      ) VALUES (?, ?, ?, ?, ?, ?)
    `,
    args: [
      tx.user_id,
      tx.type,
      tx.symbol,
      tx.quantity,
      tx.price,
      tx.created_at.toISOString(), // Store as ISO timestamp
    ],
  });
}
