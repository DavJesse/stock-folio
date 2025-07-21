import { SymbolLookupResponse } from '@/types/stock'

/**
 * In-memory cache to store search results and avoid redundant API calls.
 */
export const __cache: Map<string, SearchResult[]> = new Map()

/**
 * Represents a single search result from the stock lookup API.
 */
export type SearchResult = {
  symbol: string
  name: string
  type: string
  region: string
}

/**
 * Performs a stock symbol or name lookup using the Finnhub API.
 *
 * @param query - The raw input string to search for.
 * @returns A list of matching stock results or an empty array if none found or on error.
 */
export async function stockSearch(query: string): Promise<SearchResult[]> {
  const trimmedQuery = query.trim().toUpperCase()

  // Return empty result for blank input
  if (!trimmedQuery) return []

  // Return cached result if available
  if (__cache.has(trimmedQuery)) {
    return __cache.get(trimmedQuery)!
  }

  const apiKey = process.env.NEXT_PUBLIC_FINNHUB_API_KEY
  const url = `https://finnhub.io/api/v1/search?q=${trimmedQuery}&token=${apiKey}`

  try {
    const res = await fetch(url)
    if (!res.ok) throw new Error('Network response was not ok')

    const data: SymbolLookupResponse = await res.json()

    // Normalize the API result into a simplified structure
    const formatted: SearchResult[] = data.result.map((item) => ({
      symbol: item.symbol,
      name: item.description,
      type: item.type,
      region: item.mic,
    }))

    // Cache and return the result
    __cache.set(trimmedQuery, formatted)
    return formatted
  } catch (err) {
    console.error('Stock search error:', err)
    return []
  }
}
