import { useCallback, useState } from 'react'
import { SearchResult } from '@/types/stock'
import { stockSearch } from '@/lib/stock/stock-search'

/**
 * Custom hook to handle stock search logic.
 * Manages state for search results, loading status, and error messages.
 */
export function useSearchStocks() {
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Performs a stock search based on the query string.
   * Trims input, handles loading state, and catches any potential errors.
   */
  const search = useCallback(async (query: string) => {
    const trimmed = query.trim()

    // Skip search if query is empty after trimming
    if (!trimmed) {
      setResults([])
      return
    }

    setLoading(true)
    setError(null)

    try {
      const stocks = await stockSearch(trimmed)
      setResults(stocks)
    } catch (err) {
      console.error('Search error:', err)
      setError('Failed to fetch search results')
    } finally {
      setLoading(false)
    }
  }, [])

  return { results, loading, error, search }
}
