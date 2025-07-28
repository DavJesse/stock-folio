type PortfolioEntry = {
  symbol: string
  quantity: number
  initialPrice: number
}

type LiveQuote = {
  symbol: string
  price: number
  name?: string
}

export function mergePortfolioWithLiveQuotes(
  portfolio: PortfolioEntry[],
  liveData: LiveQuote[]
) {
  return portfolio.map((entry) => {
    const quote = liveData.find((q) => q.symbol === entry.symbol)

    return {
      ...entry,
      currentPrice: quote?.price ?? 0,
      company: quote?.name ?? entry.symbol,
    }
  })
}
