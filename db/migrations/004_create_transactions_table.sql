-- Migration: Create transactions table
-- This table stores user transactions for the stock portfolio tracker application.

CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,       -- Unique transaction ID
    user_id INTEGER NOT NULL,                   -- Foreign key to users table
    symbol TEXT NOT NULL,                       -- Stock symbol involved in the transaction
    quantity INTEGER NOT NULL,                  -- Number of shares bought or sold
    price REAL NOT NULL,                        -- Price per share at time of transaction
    type TEXT NOT NULL CHECK (type IN ('buy', 'sell', 'deposit')), -- Transaction type
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
