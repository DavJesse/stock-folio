'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { useSearchStocks } from '@/hooks/use-search-stocks'
import Link from 'next/link'

/**
 * Enhanced Compact StockSearchBar Component
 * Features: keyboard navigation, debounced search, accessibility improvements,
 * click-outside to close, and better UX - optimized for smaller spaces
 */
export default function StockSearchBar() {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null)
  
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLUListElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  
  const { results, loading, error, search } = useSearchStocks()

  // Debounced search function
  const debouncedSearch = useCallback((value: string) => {
    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }
    
    const timer = setTimeout(() => {
      search(value)
      if (value.trim()) {
        setIsOpen(true)
      }
    }, 300)
    
    setDebounceTimer(timer)
  }, [debounceTimer, search])

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    setSelectedIndex(-1)
    
    if (value.trim()) {
      debouncedSearch(value)
    } else {
      setIsOpen(false)
      search('')
    }
  }

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || results.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < results.length - 1 ? prev + 1 : 0
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : results.length - 1
        )
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < results.length) {
          const selectedStock = results[selectedIndex]
          window.location.href = `/dashboard/stocks/${selectedStock.symbol}`
        }
        break
      case 'Escape':
        setIsOpen(false)
        setSelectedIndex(-1)
        inputRef.current?.blur()
        break
    }
  }

  // Clear search
  const clearSearch = () => {
    setQuery('')
    setIsOpen(false)
    setSelectedIndex(-1)
    search('')
    inputRef.current?.focus()
  }

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSelectedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Clean up debounce timer
  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer)
      }
    }
  }, [debounceTimer])

  // Scroll selected item into view
  useEffect(() => {
    if (selectedIndex >= 0 && dropdownRef.current) {
      const selectedElement = dropdownRef.current.children[selectedIndex] as HTMLElement
      selectedElement?.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth'
      })
    }
  }, [selectedIndex])

  const showDropdown = isOpen && (results.length > 0 || loading || error)

  return (
    <div className="relative w-full flex justify-center">
      <div className="w-[60%] relative" ref={containerRef}>
        {/* Compact Search Container */}
        <div className="relative">
          <div className="group relative">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                if (query.trim() && results.length > 0) {
                  setIsOpen(true)
                }
              }}
              placeholder="Search stocks..."
              className="w-full h-10 pl-10 pr-12 py-2 text-sm text-white bg-[var(--primary-background)] border-2 border-gray-600/50 rounded-full shadow-md transition-all duration-300 ease-in-out focus:outline-none focus:border-blue-400 focus:shadow-lg focus:shadow-blue-400/20 hover:border-gray-500/70 hover:shadow-lg placeholder:text-gray-400"
              aria-label="Search stocks"
              role="combobox"
              aria-expanded={!!showDropdown}
              aria-haspopup="listbox"
              aria-owns={showDropdown ? "stock-results-small" : undefined}
              aria-activedescendant={
                selectedIndex >= 0 ? `stock-result-small-${selectedIndex}` : undefined
              }
              autoComplete="off"
            />
            
            {/* Search Icon */}
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            
            {/* Clear button */}
            {query && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 focus:outline-none focus:text-white focus:bg-white/10 transition-all duration-200 text-lg font-light"
                aria-label="Clear search"
                tabIndex={0}
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Compact Dropdown */}
        {showDropdown && (
          <div className="absolute left-0 right-0 w-full mt-2 bg-[var(--primary-background)]/95 backdrop-blur-xl border-2 border-gray-600/30 rounded-xl shadow-xl shadow-black/30 z-50 max-h-[350px] overflow-hidden"
            style={{
              animation: 'slideInFromTop 0.2s ease-out'
            }}
          >
            {/* Loading indicator */}
            {loading && (
              <div className="p-4 text-[var(--success-color)] text-center">
                <div className="flex items-center justify-center gap-2 text-sm">
                  <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full"></div>
                  <span>Searching...</span>
                </div>
              </div>
            )}

            {/* Error message */}
            {error && !loading && (
              <div className="p-4 text-[var(--warning-color)] text-center text-sm">
                <div className="flex items-center justify-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>{error}</span>
                </div>
              </div>
            )}

            {/* Search results */}
            {results.length > 0 && !loading && (
              <div className="p-1">
                <ul 
                  ref={dropdownRef}
                  id="stock-results-small"
                  role="listbox"
                  className="space-y-1 max-h-[280px] overflow-y-auto overflow-x-hidden"
                  style={{
                    scrollbarWidth: 'thin',
                    scrollbarColor: 'rgba(156, 163, 175, 0.5) rgba(255, 255, 255, 0.1)'
                  }}
                  aria-label="Stock search results"
                >
                  {results.map((stock, index) => (
                    <li 
                      key={`${stock.symbol}-${stock.description}`}
                      role="option"
                      aria-selected={selectedIndex === index}
                      id={`stock-result-small-${index}`}
                    >
                      <Link
                        href={`/dashboard/stocks/${stock.symbol}`}
                        scroll={false ? false : undefined}
                        className={`block p-3 rounded-lg cursor-pointer transition-all duration-200 ease-in-out hover:bg-white/10 hover:transform hover:scale-[1.01] focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-blue-400/50 group ${selectedIndex === index ? 'bg-white/15 ring-2 ring-blue-400/30' : ''}`}
                        onClick={() => {
                          setIsOpen(false)
                          setSelectedIndex(-1)
                        }}
                        onMouseEnter={() => setSelectedIndex(index)}
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="flex-1 min-w-0 pr-2">
                            {/* Stock Symbol */}
                            <div className="text-white font-semibold text-sm mb-0.5 group-hover:text-blue-300 transition-colors truncate">
                              {stock.symbol}
                            </div>
                            
                            {/* Company Description */}
                            <div className="text-gray-300 text-xs mb-0.5 truncate">
                              {stock.description}
                            </div>
                            
                            {/* Stock Type */}
                            <div className="text-gray-400 text-xs uppercase tracking-wide truncate">
                              {stock.type}
                            </div>
                          </div>
                          
                          {/* Arrow indicator */}
                          <div className="text-gray-500 group-hover:text-white transition-colors flex-shrink-0">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* No results message */}
            {!loading && !error && results.length === 0 && query.trim() && (
              <div className="p-4 text-center">
                <div className="text-gray-400 text-sm mb-1">
                  <svg className="w-8 h-8 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                  </svg>
                  No stocks found
                </div>
                <div className="text-gray-500 text-xs">
                  Try a different search term
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes slideInFromTop {
            from {
              opacity: 0;
              transform: translateY(-8px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          /* Custom scrollbar for webkit browsers */
          #stock-results-small::-webkit-scrollbar {
            width: 4px;
          }
          
          #stock-results-small::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 2px;
          }
          
          #stock-results-small::-webkit-scrollbar-thumb {
            background: rgba(156, 163, 175, 0.4);
            border-radius: 2px;
            transition: background 0.2s ease;
          }
          
          #stock-results-small::-webkit-scrollbar-thumb:hover {
            background: rgba(156, 163, 175, 0.6);
          }
          
          #stock-results-small::-webkit-scrollbar-thumb:active {
            background: rgba(156, 163, 175, 0.8);
          }
        `
      }} />
    </div>
  )
}
