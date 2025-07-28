import { calculatePortfolioSummary } from '@/lib/portfolio/calculate-portfolio-summary'

describe('calculatePortfolioSummary', () => {
  // Handles empty portfolio
  it('returns zero values when portfolio is empty', () => {
    const result = calculatePortfolioSummary([])
    expect(result).toEqual({
      totalCost: 0,
      totalValue: 0,
      totalGainLoss: 0,
    })
  })

  // Single stock with profit
  it('calculates totals correctly for single stock with profit', () => {
    const result = calculatePortfolioSummary([
      { symbol: 'AAPL', quantity: 10, initialPrice: 100, currentPrice: 120 },
    ])
    expect(result).toEqual({
      totalCost: 1000,
      totalValue: 1200,
      totalGainLoss: 200,
    })
  })

  // Multiple stocks with mixed results
  it('calculates totals correctly for multiple stocks', () => {
    const result = calculatePortfolioSummary([
      { symbol: 'AAPL', quantity: 5, initialPrice: 100, currentPrice: 110 },
      { symbol: 'TSLA', quantity: 2, initialPrice: 200, currentPrice: 150 },
    ])
    expect(result).toEqual({
      totalCost: 900,
      totalValue: 850,
      totalGainLoss: -50,
    })
  })

  // Stock with zero quantity
  it('handles zero quantity gracefully', () => {
    const result = calculatePortfolioSummary([
      { symbol: 'AAPL', quantity: 0, initialPrice: 100, currentPrice: 120 },
    ])
    expect(result).toEqual({
      totalCost: 0,
      totalValue: 0,
      totalGainLoss: 0,
    })
  })

  // Short position (negative quantity)
  it('handles negative quantity (e.g., short positions)', () => {
    const result = calculatePortfolioSummary([
      { symbol: 'AAPL', quantity: -10, initialPrice: 100, currentPrice: 90 },
    ])
    // Gain = (100 - 90) * 10 = 100
    expect(result).toEqual({
      totalCost: -1000,
      totalValue: -900,
      totalGainLoss: 100,
    })
  })

  // Invalid prices (negative values)
  it('handles negative prices gracefully (bad data)', () => {
    const result = calculatePortfolioSummary([
      { symbol: 'XYZ', quantity: 10, initialPrice: -100, currentPrice: -120 },
    ])
    expect(result).toEqual({
      totalCost: -1000,
      totalValue: -1200,
      totalGainLoss: -200,
    })
  })

  // Mix of valid and invalid entries
  it('handles mixed valid and invalid entries', () => {
    const result = calculatePortfolioSummary([
      { symbol: 'AAPL', quantity: 5, initialPrice: 100, currentPrice: 120 },
      { symbol: 'TSLA', quantity: 0, initialPrice: 300, currentPrice: 400 },
    ])
    expect(result).toEqual({
      totalCost: 500,
      totalValue: 600,
      totalGainLoss: 100,
    })
  })

  // Very large numbers (stress test)
  it('handles extremely large values without overflow', () => {
    const result = calculatePortfolioSummary([
      { symbol: 'BIG', quantity: 1_000_000, initialPrice: 1000, currentPrice: 1001 },
    ])
    expect(result).toEqual({
      totalCost: 1_000_000_000,
      totalValue: 1_001_000_000,
      totalGainLoss: 1_000_000,
    })
  })
})
