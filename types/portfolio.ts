// Base portfolio entry with only user-input or stored data
export interface PortfolioEntry {
  symbol: string             // Stock ticker (e.g., 'AAPL')
  quantity: number           // Number of shares held
  initialPrice: number       // Price at which shares were bought
}

// Extended portfolio entry with live quote and computed financials
export interface EnrichedPortfolioEntry extends PortfolioEntry {
  company: string            // Company name (e.g., 'Apple Inc.')
  currentPrice: number       // Live price fetched from API
  totalCost: number          // quantity * initialPrice
  currentValue: number       // quantity * currentPrice
  gainLoss: number           // currentValue - totalCost
  gainLossPercent: number    // (gainLoss / totalCost) * 100
}

// Aggregate values across entire portfolio
export interface PortfolioSummary {
  totalValue: number         // Sum of all currentValues
  totalCost: number          // Sum of all totalCosts
  totalGainLoss: number      // totalValue - totalCost
}
