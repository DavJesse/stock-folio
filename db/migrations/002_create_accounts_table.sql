-- Migration: Create accounts table
-- This table tracks user cash balances.

CREATE TABLE IF NOT EXISTS accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,  -- Unique account ID
    user_id INTEGER NOT NULL,              -- Foreign key to users table
    cash_balance REAL NOT NULL DEFAULT 0,  -- User’s available cash
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
