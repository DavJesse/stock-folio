import db from '@/lib/db'

/**
 * Deletes a test user and all their associated records from the database,
 * based on their user ID.
 *
 * This function is used for cleanup in testing environments.
 *
 * @param userId - The ID of the user to delete
 */
export default function deleteUserByUserId(userId: number) {
  // Step 1: Check if the user exists
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId)
  if (!user) {
    return // Exit early if user doesn't exist
  }

  // Step 2: Prepare deletion statements for related data
  const deleteTransactionsStmt = db.prepare('DELETE FROM transactions WHERE user_id = ?')
  const deletePortfolioStmt = db.prepare('DELETE FROM portfolio WHERE user_id = ?')
  const deleteAccountsStmt = db.prepare('DELETE FROM accounts WHERE user_id = ?')
  const deleteSessionsStmt = db.prepare('DELETE FROM sessions WHERE user_id = ?')
  const deleteUserStmt = db.prepare('DELETE FROM users WHERE id = ?')

  // Step 3: Execute all deletions in a single atomic transaction
  const transaction = db.transaction((id: number) => {
    deleteTransactionsStmt.run(id)
    deletePortfolioStmt.run(id)
    deleteAccountsStmt.run(id)
    deleteSessionsStmt.run(id)
    deleteUserStmt.run(id)
  })

  // Step 4: Run the transaction
  try {
    transaction(userId)
  } catch (error) {
    console.error('Error deleting user by ID:', error)
    throw error // Re-throw to allow caller to handle if needed
  }
}
