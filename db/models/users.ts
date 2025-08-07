import db from '@/lib/db'
import { User } from '@/types/user'

/**
 * Inserts a new user into the database.
 * 
 * @param user - A User object containing all required user details
 */
export function insertUser(user: User) {
  const stmt = db.prepare(`
    INSERT INTO users (id, email, password_hash, first_name, last_name, image, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `)

  return stmt.run(
    user.id,
    user.email,
    user.password_hash,
    user.first_name,
    user.last_name,
    user.image ?? null,
    user.created_at,
  )
}

/**
 * Gets a user from the database.
 */
export function getUserById(id: number): User | undefined {
  const stmt = db.prepare(`
    SELECT id, email, password_hash, first_name, last_name, image, created_at
    FROM users
    WHERE id = ?
  `)

  const row = stmt.get(id) as User | undefined;

  if (!row) return undefined

  return row;
}

/**
 * Gets a safe user (without password data) from the database.
 */
export async function getPasswordlessUserById(id: number): Promise<Omit<User, 'password_hash'> | undefined> {
  const row = db.prepare(`
    SELECT id, email, first_name, last_name, image, created_at
    FROM users
    WHERE id = ?
  `).get(id)

  return row as Omit<User, 'password_hash'> | undefined
}

/**
 * Updates a user in the database.
 */
export async function updateUserById(userId: number, data: Partial<User>) {
  const stmt = db.prepare(`
    UPDATE users
    SET first_name = ?, last_name = ?, email = ?, image = ?
    WHERE id = ?
  `)

  const result = stmt.run(
    data.first_name,
    data.last_name,
    data.email,
    data.image,
    userId
  )

  return result.changes > 0
}
