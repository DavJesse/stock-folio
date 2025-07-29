// lib/portfolio/merge-portfolio-with-live-quotes.ts
import { PortfolioEntry, EnrichedPortfolioEntry } from '@/types/portfolio'

export default function mergePortfolioWithLiveQuotes(
  portfolio: PortfolioEntry[],
  liveQuotes: { symbol: string; price: number; name?: string }[]
): EnrichedPortfolioEntry[] {
  return portfolio.map((entry) => {
    const quote = liveQuotes.find((q) => q.symbol === entry.symbol)

    const currentPrice = quote?.price ?? 0
    const company = quote?.name ?? entry.symbol

    const totalCost = entry.quantity * entry.initialPrice

    const currentValue = entry.quantity * currentPrice

    const gainLoss = currentValue - totalCost
    const gainLossPercent = totalCost === 0 ? 0 : Math.round((gainLoss / totalCost) * 100)

    return {
      ...entry,
      company,
      currentPrice,
      totalCost,
      currentValue,
      gainLoss,
      gainLossPercent,
    }
  })
}

