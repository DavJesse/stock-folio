import { calculateStockValueBreakdown } from '@/lib/portfolio/calculate-stock-value-breakdown'

describe('calculateStockValueBreakdown', () => {
  it('calculates cost, current value, gain/loss and percentage correctly', () => {
    const item = {
      symbol: 'AAPL',
      quantity: 10,
      initialPrice: 100,
      currentPrice: 150,
    }

    const result = calculateStockValueBreakdown(item)

    expect(result.totalCost).toBe(1000) // 10 shares * $100 initial price
    expect(result.currentValue).toBe(1500) // 10 shares * $150 current price
    expect(result.gainLoss).toBe(500) // $1500 - $1000
    expect(result.gainLossPercent).toBeCloseTo(50) // (500 / 1000) * 100
  })

  it('handles zero quantity gracefully', () => {
    const item = {
      symbol: 'TSLA',
      quantity: 0,
      initialPrice: 200,
      currentPrice: 250,
    }

    const result = calculateStockValueBreakdown(item)

    expect(result.totalCost).toBe(0) // No shares purchased
    expect(result.currentValue).toBe(0) // No current value with zero quantity
    expect(result.gainLoss).toBe(0)
    expect(result.gainLossPercent).toBe(0) // Avoids divide-by-zero
  })

  it('returns negative gain/loss for losses', () => {
    const item = {
      symbol: 'NFLX',
      quantity: 5,
      initialPrice: 300,
      currentPrice: 200,
    }

    const result = calculateStockValueBreakdown(item)

    expect(result.gainLoss).toBe(-500) // 5 * ($200 - $300)
    expect(result.gainLossPercent).toBeCloseTo(-33.33, 1) // (-500 / 1500) * 100
  })
})
