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
  description: string
}

/**
 * Performs a stock search by querying the backend API route.
 *
 * @param query - The search string entered by the user.
 * @returns A promise resolving to an array of search results.
 * @throws If the request fails or returns a non-OK response.
 */
export async function stockSearch(query: string): Promise<SearchResult[]> {
  if (!query.trim()) return []

  const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
  
  if (!res.ok) {
    throw new Error('Failed to fetch stock data')
  }

  const data = await res.json()
  return data.result || []
}
