import db from '@/lib/db'

export interface Account {
  id: number
  user_id: number
  cash_balance: number
}

/**
 * Retrieves an account associated with the given user ID.
 * Returns `undefined` if no account is found.
 */
export async function getAccountByUserId(userId: number): Promise<Account | undefined> {
  return db
    .prepare('SELECT * FROM accounts WHERE user_id = ?')
    .get(userId) as Account | undefined // Return account object or undefined
}

/**
 * Updates the cash balance of a user's account.
 * Also updates the `updated_at` timestamp to the current time.
 */
export async function updateCashBalance(userId: number, newBalance: number): Promise<void> {
  db.prepare(
    'UPDATE accounts SET cash_balance = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?'
  ).run(newBalance, userId) // Execute update with new balance
}
