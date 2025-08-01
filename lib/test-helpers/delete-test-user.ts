import db from '@/lib/db'

/**
 * Deletes a test user and all their associated records from the database,
 * based on their email address.
 *
 * This function is used for cleanup in testing environments.
 */
export default function deleteTestUserByEmail(email: string) {
  try {
    // Get the user ID first
    const user = db.prepare('SELECT id FROM users WHERE email = ?').get(email) as { id: number } | undefined;
            
    if (user) {
      // Delete in correct order: child records first
      db.prepare('DELETE FROM transactions WHERE user_id = ?').run(user.id);
      db.prepare('DELETE FROM portfolio WHERE user_id = ?').run(user.id); // Fixed: Added .run(user.id)
      db.prepare('DELETE FROM sessions WHERE user_id = ?').run(user.id);
      db.prepare('DELETE FROM accounts WHERE user_id = ?').run(user.id);
      db.prepare('DELETE FROM users WHERE email = ?').run(email);
    }
  } catch (error) {
    console.error('Error deleting test user:', error);
  }
}
