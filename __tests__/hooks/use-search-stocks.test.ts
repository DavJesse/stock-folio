import { renderHook, act } from '@testing-library/react'
import { waitFor } from '@testing-library/react'
import { useSearchStocks } from '@/hooks/use-search-stocks'
import { stockSearch as mockStockSearch } from '@/lib/stock/stock-search'

// Mock stockSearch module
jest.mock('@/lib/stock/stock-search', () => ({
  stockSearch: jest.fn(),
}))

describe('useSearchStocks', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('fetches search results and sets loading state', async () => {
    ;(mockStockSearch as jest.Mock).mockResolvedValue([
      {
        symbol: 'AAPL',
        name: 'Apple Inc.',
        type: 'Equity',
        region: 'US',
      },
      {
        symbol: 'GOOGL',
        name: 'Alphabet Inc.',
        type: 'Equity',
        region: 'US',
      },
    ])

    const { result } = renderHook(() => useSearchStocks())

    await act(async () => {
      await result.current.search('apple')
    })

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.results).toHaveLength(2)
    expect(result.current.results[0].symbol).toBe('AAPL')
    expect(result.current.results[1].symbol).toBe('GOOGL')
    expect(result.current.error).toBeNull()
  })

  it('returns early and clears results if query is empty or whitespace', async () => {
    const { result } = renderHook(() => useSearchStocks())

    await act(async () => {
      await result.current.search('   ') // empty/whitespace input
    })

    expect(result.current.results).toEqual([])
    expect(result.current.loading).toBe(false)
    expect(mockStockSearch).not.toHaveBeenCalled()
  })

  it('sets error when the API call fails', async () => {
    const errorMock = new Error('API failed')
    ;(mockStockSearch as jest.Mock).mockRejectedValue(errorMock)

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

    const { result } = renderHook(() => useSearchStocks())

    await act(async () => {
      await result.current.search('apple')
    })

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.results).toEqual([])
    expect(result.current.error).toBe('Failed to fetch search results')
    expect(consoleErrorSpy).toHaveBeenCalledWith('Search error:', errorMock)

    consoleErrorSpy.mockRestore()
  })
})
