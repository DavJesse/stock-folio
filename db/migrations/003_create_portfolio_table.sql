-- Migration: Create portfolio table
-- This table tracks stock holdings for each user.

CREATE TABLE IF NOT EXISTS portfolio (
    id INTEGER PRIMARY KEY AUTOINCREMENT,  -- Unique portfolio record ID
    user_id INTEGER NOT NULL,              -- Foreign key to users table
    symbol TEXT NOT NULL,                  -- Stock symbol (e.g., AAPL)
    quantity INTEGER NOT NULL,             -- Number of shares
    average_price REAL NOT NULL,           -- Average price per share
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
