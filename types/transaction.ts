// Consolidated type containing all properties of a row in the transactions table
export type TransactionRow = {
  symbol: string             // Stock symbol (e.g., AAPL, MSFT)
  type: 'buy' | 'sell'       // Transaction type: 'buy' or 'sell'
  quantity: number           // Number of shares involved in the transaction
  price: number              // Price per share at time of transaction
  created_at: string         // Timestamp when transaction occurred
}
