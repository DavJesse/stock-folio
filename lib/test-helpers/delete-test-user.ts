import db from '@/lib/db'
import { User } from '@/types/user'

/**
 * Deletes a test user and all their associated records from the database,
 * based on their email address.
 *
 * This function is used for cleanup in testing environments.
 */
export default function deleteTestUserByEmail(email: string) {
  // Step 1: Look up the user by email
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as User
  if (!user) {
    return // Exit early if user doesn't exist
  }

  // Step 2: Prepare deletion statements for related data
  const deleteTransactionsStmt = db.prepare('DELETE FROM transactions WHERE user_id = ?')
  const deleteAccountsStmt = db.prepare('DELETE FROM accounts WHERE user_id = ?')
  const deleteSessionsStmt = db.prepare('DELETE FROM sessions WHERE user_id = ?')
  const deleteUserStmt = db.prepare('DELETE FROM users WHERE id = ?')

  // Step 3: Execute all deletions in a single atomic transaction
  const transaction = db.transaction((userId: number) => {
    deleteTransactionsStmt.run(userId) // Delete all transactions owned by the user
    deleteAccountsStmt.run(userId)     // Delete all accounts owned by the user
    deleteSessionsStmt.run(userId)     // Delete all sessions associated with the user
    deleteUserStmt.run(userId)         // Delete the user entry itself
  })

  // Step 4: Run the transaction
  transaction(user.id)
}
