import { SearchResult, SymbolLookupResponse } from '@/types/stock'

const BASE_URL = 'https://finnhub.io/api/v1'
const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY as string

// In-memory cache for the current server session
const cache = new Map<string, SearchResult | null>()

/**
 * Fetches and returns a normalized stock search result based on user query.
 * Falls back to fuzzy matching by company name if exact symbol is not found.
 */
export async function stockSearch(query: string): Promise<SearchResult | null> {
  const trimmedQuery = query.trim()
  if (!trimmedQuery) return null

  const normalizedQuery = trimmedQuery.toLowerCase()

  // Return cached result if available
  if (cache.has(normalizedQuery)) {
    return cache.get(normalizedQuery) ?? null
  }

  const url = `${BASE_URL}/search?q=${encodeURIComponent(trimmedQuery)}&token=${FINNHUB_API_KEY}`

  try {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`Finnhub API returned ${res.status}`)

    const data: SymbolLookupResponse = await res.json()

    // Attempt exact match by symbol
    const symbolMatch = data.result.find(
      (stock) => stock.symbol.toLowerCase() === normalizedQuery
    )
    if (symbolMatch) {
      const result = formatResult(symbolMatch)
      cache.set(normalizedQuery, result)
      return result
    }

    // Attempt partial match by company name
    const nameMatch = data.result.find(
      (stock) => stock.description.toLowerCase().includes(normalizedQuery)
    )
    if (nameMatch) {
      const result = formatResult(nameMatch)
      cache.set(normalizedQuery, result)
      return result
    }

    // No match found — cache and return null
    cache.set(normalizedQuery, null)
    return null
  } catch (err) {
    console.error('Stock search failed:', err)
    return null
  }
}

/**
 * Maps API result to internal search result format.
 */
function formatResult(item: SymbolLookupResponse['result'][number]): SearchResult {
  return {
    symbol: item.symbol,         // e.g. 'AAPL'
    name: item.description,      // e.g. 'Apple Inc'
    type: item.type,             // e.g. 'Common Stock'
    region: item.mic,            // e.g. 'XNAS'
  }
}

// Export cache for testing or debugging
export const __cache = cache
