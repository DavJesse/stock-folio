type StockItem = {
  symbol: string
  quantity: number
  initialPrice: number
  currentPrice: number
}

/**
 * Calculates the stock's value breakdown including:
 * - totalCost: original investment (initialPrice * quantity)
 * - currentValue: current market value (currentPrice * quantity)
 * - gainLoss: absolute profit or loss
 * - gainLossPercent: percentage change relative to cost
 */
export function calculateStockValueBreakdown(item: StockItem) {
  const totalCost = item.quantity * item.initialPrice
  const currentValue = item.quantity * item.currentPrice
  const gainLoss = currentValue - totalCost

  // Avoid divide-by-zero; if no cost, percent change is 0
  const gainLossPercent = totalCost > 0 ? (gainLoss / totalCost) * 100 : 0

  return {
    totalCost,
    currentValue,
    gainLoss,
    gainLossPercent,
  }
}
