import db from '@/lib/db'

/**
 * Deletes a user and all their associated records from the database,
 * based on their user ID.
 *
 * This function is used for cleanup in testing environments.
 *
 * @param userId - The ID of the user to delete
 */
export default async function deleteUserByUserId(userId: number) {
  try {
    // Step 1: Check if the user exists
    const res = await db.execute({
      sql: 'SELECT id FROM users WHERE id = ?',
      args: [userId],
    })

    if (res.rows.length === 0) return

    // Step 2: Start transaction
    await db.execute('BEGIN')

    // Step 3: Delete related records
    await db.execute({ sql: 'DELETE FROM transactions WHERE user_id = ?', args: [userId] })
    await db.execute({ sql: 'DELETE FROM portfolio WHERE user_id = ?', args: [userId] })
    await db.execute({ sql: 'DELETE FROM accounts WHERE user_id = ?', args: [userId] })
    await db.execute({ sql: 'DELETE FROM sessions WHERE user_id = ?', args: [userId] })

    // Step 4: Delete the user
    await db.execute({ sql: 'DELETE FROM users WHERE id = ?', args: [userId] })

    // Step 5: Commit
    await db.execute('COMMIT')
  } catch (error) {
    console.error('Error deleting user by ID:', error)

    // Roll back if anything fails
    try {
      await db.execute('ROLLBACK')
    } catch {}

    throw error
  }
}
