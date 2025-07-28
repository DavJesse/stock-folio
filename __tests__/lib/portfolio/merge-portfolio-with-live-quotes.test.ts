import { mergePortfolioWithLiveQuotes } from '@/lib/portfolio/merge-portfolio-with-live-quotes'

describe('mergePortfolioWithLiveQuotes', () => {
  it('merges portfolio and live data correctly', () => {
    // Setup: Portfolio data and corresponding live data
    const portfolio = [
      { symbol: 'AAPL', quantity: 10, initialPrice: 100 },
      { symbol: 'TSLA', quantity: 5, initialPrice: 200 },
    ]

    const liveData = [
      { symbol: 'AAPL', price: 150, name: 'Apple Inc.' },
      { symbol: 'TSLA', price: 180, name: 'Tesla Inc.' },
    ]

    // Action: Merge portfolio with live quote data
    const result = mergePortfolioWithLiveQuotes(portfolio, liveData)

    // Assertion: Each merged item contains current price and company name from live data
    expect(result).toEqual([
      {
        symbol: 'AAPL',
        quantity: 10,
        initialPrice: 100,
        currentPrice: 150,
        company: 'Apple Inc.',
      },
      {
        symbol: 'TSLA',
        quantity: 5,
        initialPrice: 200,
        currentPrice: 180,
        company: 'Tesla Inc.',
      },
    ])
  })

  it('handles missing live data gracefully', () => {
    // Setup: Portfolio contains one item, live data is empty
    const portfolio = [{ symbol: 'AAPL', quantity: 10, initialPrice: 100 }]
    const liveData: { symbol: string; price: number; name?: string }[] = []

    // Action: Merge with no live data available
    const result = mergePortfolioWithLiveQuotes(portfolio, liveData)

    // Assertion: Fallbacks to symbol for company name and zero for price
    expect(result[0].currentPrice).toBe(0)
    expect(result[0].company).toBe('AAPL')
  })
})
