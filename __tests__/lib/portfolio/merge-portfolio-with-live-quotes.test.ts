import mergePortfolioWithLiveQuotes from '@/lib/portfolio/merge-portfolio-with-live-quotes'

describe('mergePortfolioWithLiveQuotes', () => {
  it('merges portfolio and live data correctly', () => {
    const portfolio = [
      { symbol: 'AAPL', quantity: 10, initialPrice: 100 },
      { symbol: 'TSLA', quantity: 5, initialPrice: 200 },
    ]

    const liveData = [
      { symbol: 'AAPL', price: 150, name: 'Apple Inc.' },
      { symbol: 'TSLA', price: 180, name: 'Tesla Inc.' },
    ]

    const result = mergePortfolioWithLiveQuotes(portfolio, liveData)

    expect(result).toEqual([
      {
        symbol: 'AAPL',
        quantity: 10,
        initialPrice: 100,
        currentPrice: 150,
        company: 'Apple Inc.',
        totalCost: 1000,
        currentValue: 1500,
        gainLoss: 500,
        gainLossPercent: 50,
      },
      {
        symbol: 'TSLA',
        quantity: 5,
        initialPrice: 200,
        currentPrice: 180,
        company: 'Tesla Inc.',
        totalCost: 1000,
        currentValue: 900,
        gainLoss: -100,
        gainLossPercent: -10,
      },
    ])
  })

  it('handles missing live data gracefully', () => {
    const portfolio = [{ symbol: 'AAPL', quantity: 10, initialPrice: 100 }]
    const liveData: { symbol: string; price: number; name?: string }[] = []

    const result = mergePortfolioWithLiveQuotes(portfolio, liveData)

    expect(result).toEqual([
      {
        symbol: 'AAPL',
        quantity: 10,
        initialPrice: 100,
        currentPrice: 0,
        company: 'AAPL', // fallback to symbol
        totalCost: 1000,
        currentValue: 0,
        gainLoss: -1000,
        gainLossPercent: -100,
      },
    ])
  })
})
