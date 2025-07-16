import db from '@/lib/db'
import { User } from '@/types/user'

export async function findUserByEmail(email: string): Promise<User | null> {
  try {
    const row = db
      .prepare('SELECT * FROM users WHERE email = ?')
      .get(email) as User | undefined;

    return row ?? null
  } catch (err) {
    console.error('DB error in findUserByEmail:', err)
    return null
  }
}
