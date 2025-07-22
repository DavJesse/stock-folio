import debounce from 'lodash.debounce'
import { stockSearch } from '@/lib/stock/stock-search'

/**
 * Represents a single search result returned from the stock search API.
 */
export type SearchResult = {
  symbol: string
  name: string
  type: string
  region: string
  description: string
}

/**
 * Creates a debounced stock search function.
 *
 * @param setResults - Callback to update the search results.
 * @param setError - Callback to update the error state.
 * @returns A debounced function that takes a query string and performs the search.
 */
export function createDebouncedStockSearch(
  setResults: (results: SearchResult[]) => void,
  setError: (err: string | null) => void
) {
  return debounce(async (query: string) => {
    try {
      const results = await stockSearch(query)
      setResults(results)
      setError(null)
    } catch (err: unknown) {
      setResults([])
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Something went wrong')
      }
    }
  }, 300)
}
