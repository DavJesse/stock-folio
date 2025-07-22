import { createDebouncedStockSearch, SearchResult } from '@/lib/stock/create-debounced-stock-search'
import { stockSearch } from '@/lib/stock/stock-search'

// Mock lodash.debounce by returning the original function (no delay)
jest.mock('lodash.debounce', () => {
  return (fn: (...args: unknown[]) => unknown) => fn
})

// Mock only the stockSearch function from the module
jest.mock('@/lib/stock/stock-search', () => {
  const actual = jest.requireActual('@/lib/stock/stock-search')
  return {
    ...actual,
    stockSearch: jest.fn(),
  }
})

describe('createDebouncedStockSearch', () => {
  const setResults = jest.fn()
  const setError = jest.fn()
  let search: ReturnType<typeof createDebouncedStockSearch>

  beforeEach(() => {
    jest.clearAllMocks()
    search = createDebouncedStockSearch(setResults, setError)
  })

  it('calls setResults and clears error on successful search', async () => {
    const mockResults: SearchResult[] = [
      {
        symbol: 'AAPL',
        name: 'Apple Inc.',
        type: 'Equity',
        region: 'US',
        description: 'Apple Inc. designs and manufactures smartphones.',
      },
    ]

    ;(stockSearch as jest.Mock).mockResolvedValue(mockResults)

    await search('apple')

    expect(stockSearch).toHaveBeenCalledWith('apple')
    expect(setResults).toHaveBeenCalledWith(mockResults)
    expect(setError).toHaveBeenCalledWith(null)
  })

  it('calls setError with the error message if stockSearch throws an Error', async () => {
    const error = new Error('API is down')
    ;(stockSearch as jest.Mock).mockRejectedValue(error)

    await search('tesla')

    expect(setResults).toHaveBeenCalledWith([])
    expect(setError).toHaveBeenCalledWith('API is down')
  })

  it('calls setError with fallback message if stockSearch throws a non-Error', async () => {
    ;(stockSearch as jest.Mock).mockRejectedValue('Something unexpected')

    await search('nvidia')

    expect(setResults).toHaveBeenCalledWith([])
    expect(setError).toHaveBeenCalledWith('Something went wrong')
  })
})
