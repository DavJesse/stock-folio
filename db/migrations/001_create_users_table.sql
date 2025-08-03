-- Migration: Create users table
-- This table stores user accounts for the stock portfolio tracker application.

CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,            -- Unique user identifier
    email TEXT NOT NULL UNIQUE,                      -- User email address (must be unique)
    password_hash TEXT NOT NULL,                     -- Hashed user password
    first_name TEXT NOT NULL,                        -- User's first name (required)
    last_name TEXT NOT NULL,                         -- User's last name (required)
    image TEXT,                                      -- Optional user image
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP    -- Timestamp when the user was created
);

