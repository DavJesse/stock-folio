import db from '@/lib/db'
import { User } from '@/types/user'

export async function findUserByEmail(email: string): Promise<User | null> {
  try {
    const result = await db.execute({
      sql: 'SELECT * FROM users WHERE email = ?',
      args: [email],
    })

    // If no user found, return null
    if (result.rows.length === 0) {
      return null
    }

    // Turso rows are returned as objects automatically
    const user = result.rows[0] as unknown as User
    return user
  } catch (err) {
    console.error('DB error in findUserByEmail:', err)
    return null
  }
}
