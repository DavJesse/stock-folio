/**
 * Represents a registered user in the system.
 * This type is used across authentication, session, and user management logic.
 */
export type User = {
  id: number; // Unique identifier for the user (primary key)
  email: string; // User's email address (must be unique)
  password_hash: string; // Hashed password for secure storage
  created_at: string; // Timestamp indicating when the user was created
};
