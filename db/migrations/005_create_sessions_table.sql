-- Migration: Create sessions table
-- This table stores user sessions for the stock portfolio tracker application.

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY, -- UUID
  user_id INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME NOT NULL,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);
