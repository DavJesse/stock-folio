// --- Imports ---
import { stockSearch } from '@/lib/stock/stock-search'
import { SymbolLookupResponse } from '@/types/stock'
import { __cache } from '@/lib/stock/stock-search'

global.fetch = jest.fn()

// --- Mock Data ---
const mockData: SymbolLookupResponse = {
  count: 2,
  result: [
    {
      symbol: 'AAPL',
      description: 'Apple Inc.',
      displaySymbol: 'AAPL',
      type: 'Common Stock',
      mic: 'XNAS',
    },
    {
      symbol: 'MSFT',
      description: 'Microsoft Corporation',
      displaySymbol: 'MSFT',
      type: 'Common Stock',
      mic: 'XNAS',
    },
  ],
}

// --- Test Suite ---
describe('stockSearch', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    __cache.clear()
  })

  it('returns an empty array for empty query', async () => {
    const result = await stockSearch('   ')
    expect(result).toEqual([])
  })

  it('returns a match by symbol', async () => {
    // Mock a successful API response
    ;(fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockData,
    })

    const result = await stockSearch('AAPL')

    expect(result).toEqual([
      {
        symbol: 'AAPL',
        description: 'Apple Inc.',
        displaySymbol: 'AAPL',
        type: 'Common Stock',
        mic: 'XNAS',
      },
      {
        symbol: 'MSFT',
        description: 'Microsoft Corporation',
        displaySymbol: 'MSFT',
        type: 'Common Stock',
        mic: 'XNAS',
      },
    ])
  })

  it('returns a match by company name', async () => {
    ;(fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockData,
    })

    const result = await stockSearch('microsoft')

    expect(result).toEqual([
      {
        symbol: 'AAPL',
        description: 'Apple Inc.',
        displaySymbol: 'AAPL',
        type: 'Common Stock',
        mic: 'XNAS',
      },
      {
        symbol: 'MSFT',
        description: 'Microsoft Corporation',
        displaySymbol: 'MSFT',
        type: 'Common Stock',
        mic: 'XNAS',
      },
    ])
  })

  it('returns an empty array when no match is found', async () => {
    const emptyData: SymbolLookupResponse = { count: 0, result: [] }

    ;(fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => emptyData,
    })

    const result = await stockSearch('nonexistent')
    expect(result).toEqual([])
  })

  it('throws an error if API call fails', async () => {
  ;(fetch as jest.Mock).mockRejectedValue(new Error('API failure'))

  await expect(stockSearch('AAPL')).rejects.toThrow('API failure')
})
})
