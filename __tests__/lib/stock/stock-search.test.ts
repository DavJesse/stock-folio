import { stockSearch } from '@/lib/stock/stock-search'
import { SymbolLookupResponse } from '@/types/stock'
import { __cache } from '@/lib/stock/stock-search'

global.fetch = jest.fn()

// Mock response returned by the external API
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

describe('stockSearch', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    __cache.clear()
  })

  it('returns null for empty query', async () => {
    const result = await stockSearch('   ')
    expect(result).toBeNull()
  })

  it('returns a match by symbol', async () => {
    ;(fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockData,
    })

    const result = await stockSearch('AAPL')

    expect(result).toEqual({
      symbol: 'AAPL',
      name: 'Apple Inc.',
      type: 'Common Stock',
      region: 'XNAS',
    })
  })

  it('returns a match by company name', async () => {
    ;(fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockData,
    })

    const result = await stockSearch('microsoft')

    expect(result).toEqual({
      symbol: 'MSFT',
      name: 'Microsoft Corporation',
      type: 'Common Stock',
      region: 'XNAS',
    })
  })

  it('returns null when no match is found', async () => {
    const emptyData = { count: 0, result: [] }

    ;(fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => emptyData,
    })

    const result = await stockSearch('nonexistent')
    expect(result).toBeNull()
  })

  it('returns null and logs an error if API call fails', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

    ;(fetch as jest.Mock).mockRejectedValue(new Error('API failure'))

    const result = await stockSearch('AAPL')

    expect(result).toBeNull()
    expect(consoleSpy).toHaveBeenCalledWith(
      'Stock search failed:',
      expect.any(Error)
    )

    consoleSpy.mockRestore()
  })
})
