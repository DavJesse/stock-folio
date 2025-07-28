// lib/portfolio/calculatePortfolioSummary.ts

interface PortfolioItem {
  symbol: string
  quantity: number
  initialPrice: number
  currentPrice: number
}

interface PortfolioSummary {
  totalCost: number
  totalValue: number
  totalGainLoss: number
}

/**
 * Calculates total portfolio cost, value, and gains/losses.
 * - totalCost: quantity * initialPrice
 * - totalValue: quantity * currentPrice
 * - totalGainLoss: totalValue - totalCost
 */
export function calculatePortfolioSummary(portfolio: PortfolioItem[]): PortfolioSummary {
  return portfolio.reduce<PortfolioSummary>(
    (summary, item) => {
      const { quantity, initialPrice, currentPrice } = item

      const cost = quantity * initialPrice
      const value = quantity * currentPrice
      const gainLoss = value - cost

      return {
        totalCost: summary.totalCost + cost,
        totalValue: summary.totalValue + value,
        totalGainLoss: summary.totalGainLoss + gainLoss,
      }
    },
    { totalCost: 0, totalValue: 0, totalGainLoss: 0 }
  )
}
