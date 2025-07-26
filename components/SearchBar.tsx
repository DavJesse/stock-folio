'use client'

import React, { useState } from 'react'
import { useSearchStocks } from '@/hooks/use-search-stocks'
import Link from 'next/link'

/**
 * StockSearchBar Component
 * Renders a stock search input with real-time suggestions.
 * Uses the `useSearchStocks` custom hook for fetching data.
 */
export default function StockSearchBar() {
  const [query, setQuery] = useState('')
  const { results, loading, error, search } = useSearchStocks()

  /**
   * Handles input change by updating the query state
   * and triggering a stock search.
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    search(value)
  }

  return (
    <div className="relative w-full flex justify-center">
      <div className="w-[70%] relative">
        <input
          type="text"
          value={query}
          onChange={handleChange}
          placeholder="Search stocks..."
          className="border px-8 py-1 text-white w-full bg-[var(--primary-background)] pr-10"
        />
        {/* Clear button appears when there's an active query */}
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('')
              search('') // Clears the search results
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-red-400 focus:outline-none"
            aria-label="Clear search"
          >
            ×
          </button>
        )}

        {/* Loading indicator */}
        {loading && (
          <div className="text-[var(--success-color)]">
            Loading...
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="text-[var(--warning-color)]">
            {error}
          </div>
        )}

        {/* Search results dropdown */}
        {results.length > 0 && (
          <ul className="absolute left-0 right-0 w-full mt-2 bg-white/5 backdrop-blur-md rounded-lg shadow-lg z-50">
            {results.map((stock) => (
              <li key={`${stock.symbol}-${stock.description}`}>
                <Link
                    href={`/dashboard/stocks/${stock.symbol}`}
                    scroll={false}
                    className="p-2 text-white hover:bg-white/10 cursor-pointer hover:scale-102 transition-transform"
                >
                  <strong>{stock.symbol}</strong> - {stock.description} ({stock.type})
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
