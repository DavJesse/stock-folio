import db from '@/lib/db';

export interface Account {
  id: number;
  user_id: number;
  cash_balance: number;
}

/**
 * Retrieves an account associated with the given user ID.
 * Returns `undefined` if no account is found.
 */
export async function getAccountByUserId(userId: number): Promise<Account | undefined> {
  const result = await db.execute({
    sql: "SELECT * FROM accounts WHERE user_id = ?",
    args: [userId],
  });

  // result.rows is an array of records
  return (result.rows[0] as unknown as Account) ?? undefined;
}

/**
 * Updates the cash balance of a user's account.
 * Also updates the `updated_at` timestamp to the current time.
 */
export async function updateCashBalance(userId: number, newBalance: number): Promise<void> {
  await db.execute({
    sql: `
      UPDATE accounts
      SET cash_balance = ?, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ?
    `,
    args: [newBalance, userId],
  });
}
