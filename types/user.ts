/**
 * Represents a registered user in the system.
 * This type is used across authentication, session, and user management logic.
 */
export type User = {
  id: number;             // Unique identifier for the user (primary key)
  email: string;          // User's email address (must be unique)
  password_hash: string;  // Hashed password for secure storage
  first_name: string;     // User's first name (required)
  last_name: string;      // User's last name (required)
  image?: string;         // Optional user image
  created_at: string;     // Timestamp when the user was created
};
