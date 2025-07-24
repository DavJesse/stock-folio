import db from '@/lib/db'

/**
 * Represents a user of the application.
 */
type User = {
  id: number           // Unique identifier for the user (primary key)
  email: string        // User's email address (must be unique)
  password_hash: string // Hashed password for secure storage
  created_at: Date     // Timestamp when the user account was created
}

/**
 * Inserts a new user into the database.
 * 
 * @param user - A User object containing all required user details
 */
export function insertUser(user: User) {
  const stmt = db.prepare(`
    INSERT INTO users (id, email, password_hash, created_at)
    VALUES (?, ?, ?, ?)
  `)

  return stmt.run(
    user.id,
    user.email,
    user.password_hash,
    user.created_at.toISOString() // Ensure consistent date format
  )
}
