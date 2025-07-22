'use client'

import { useState, useMemo } from 'react'
import {
  SearchResult,
  createDebouncedStockSearch,
} from '@/lib/stock/create-debounced-stock-search'

/**
 * Custom hook for searching stock symbols with debounced input.
 * Returns search results, loading state, error message, and the search function.
 */
export function useSearchStocks() {
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Memoized debounced search function to prevent recreation on re-renders.
   * Automatically updates loading and error state based on the response.
   */
  const debouncedSearch = useMemo(
    () =>
      createDebouncedStockSearch(
        (res) => {
          setResults(res)
          setLoading(false)
        },
        (err) => {
          setError(err)
          setLoading(false)
        }
      ),
    []
  )

  /**
   * Call this function to trigger a search for the given query.
   * It ignores empty or whitespace-only input.
   */
  function search(query: string) {
    if (!query.trim()) {
      setResults([])
      setLoading(false)
      setError(null)
      return
    }

    setLoading(true)
    setError(null)
    debouncedSearch(query)
  }

  return {
    results,
    loading,
    error,
    search,
  }
}
