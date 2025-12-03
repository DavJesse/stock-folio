import db from '@/lib/db'

/**
 * Deletes a test user and all their associated records from the database,
 * based on their email address.
 *
 * This function is used for cleanup in testing environments.
 */
export default async function deleteTestUserByEmail(email: string) {
  try {
    // Get the user ID first
    const result = await db.execute({
      sql: 'SELECT id FROM users WHERE email = ?',
      args: [email],
    });

    const user = result.rows[0];
    if (!user) return;

    const userId = user.id;

    // Delete in correct order: child records first
    await db.execute({ sql: 'DELETE FROM transactions WHERE user_id = ?', args: [userId] });
    await db.execute({ sql: 'DELETE FROM portfolio WHERE user_id = ?', args: [userId] });
    await db.execute({ sql: 'DELETE FROM sessions WHERE user_id = ?', args: [userId] });
    await db.execute({ sql: 'DELETE FROM accounts WHERE user_id = ?', args: [userId] });
    await db.execute({ sql: 'DELETE FROM users WHERE email = ?', args: [email] });

  } catch (error) {
    console.error('Error deleting test user:', error);
  }
}
