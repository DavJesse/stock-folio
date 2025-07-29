/**
 * Response format from the symbol lookup API.
 * Contains a count and a list of matching results.
 */
export interface SymbolLookupResponse {
  count: number
  result: {
    description: string   // Full company or instrument name
    displaySymbol: string // Ticker symbol used for display (e.g., 'AAPL')
    symbol: string        // Raw symbol identifier
    type: string          // Type of asset (e.g., 'Common Stock', 'ETF')
    mic: string           // Market Identifier Code (e.g., 'XNAS' for NASDAQ)
  }[]
}

/**
 * Internal search result structure used by the frontend UI.
 * Maps key metadata from SymbolLookupResponse or other sources.
 */
export interface SearchResult {
  symbol: string // Ticker symbol (e.g., 'AAPL')
  name: string   // Display name or description
  type: string   // Asset type (e.g., 'Stock', 'ETF')
  region: string // Geographic market region (e.g., 'US', 'EU')
}

/**
 * Live stock price structure used in portfolio rendering.
 * ontains stock symbol, current price, and company name.
 */
export interface LiveQuote {
  symbol: string
  price: number
  company?: string
}