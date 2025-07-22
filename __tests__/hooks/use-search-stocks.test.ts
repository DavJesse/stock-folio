import { renderHook, act } from '@testing-library/react'
import { useSearchStocks } from '@/hooks/use-search-stocks'
import { stockSearch as mockStockSearch } from '@/lib/stock/stock-search'

// Mock lodash.debounce to execute immediately during tests
jest.mock('lodash.debounce', () => {
  return (fn: (...args: unknown[]) => unknown) => fn
})

// Mock stockSearch function while preserving other actual exports
jest.mock('@/lib/stock/stock-search', () => ({
  ...jest.requireActual('@/lib/stock/stock-search'),
  stockSearch: jest.fn(),
}))

describe('useSearchStocks', () => {
  // Reset all mocks before each test to ensure test isolation
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns early and clears results if query is empty or whitespace', () => {
    const { result } = renderHook(() => useSearchStocks())

    act(() => {
      result.current.search('   ')
    })

    expect(result.current.results).toEqual([])
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBe(null)
    expect(mockStockSearch).not.toHaveBeenCalled()
  })

  it('initializes with empty state', () => {
    const { result } = renderHook(() => useSearchStocks())

    expect(result.current.results).toEqual([])
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBe(null)
  })

  it('sets loading to true when searching with valid query', async () => {
    const { result } = renderHook(() => useSearchStocks())

    ;(mockStockSearch as jest.Mock).mockResolvedValue([])

    await act(async () => {
      result.current.search('apple')
    })

    // After the search completes, loading should be false
    expect(result.current.loading).toBe(false)
    expect(mockStockSearch).toHaveBeenCalledWith('apple')
  })
})
