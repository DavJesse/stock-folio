/**
 * Fetches the current quote and company profile for a given stock symbol.
 *
 * - Uses the Finnhub API to fetch both quote and profile data in parallel.
 * - Falls back to the symbol as the company name if profile is unavailable.
 * - Ensures `currentPrice` defaults to 0 if not present.
 *
 * @param symbol - The stock symbol (e.g. "AAPL")
 * @param apiKey - Your Finnhub API token
 * @returns An object with symbol, company name, and current price
 * @throws Error if quote fetch fails
 */
export async function fetchQuoteAndProfile(symbol: string, apiKey: string) {
  const upperSymbol = symbol.toUpperCase()

  const quoteUrl = `https://finnhub.io/api/v1/quote?symbol=${upperSymbol}&token=${apiKey}`
  const profileUrl = `https://finnhub.io/api/v1/stock/profile2?symbol=${upperSymbol}&token=${apiKey}`

  const [quoteRes, profileRes] = await Promise.all([
    fetch(quoteUrl),
    fetch(profileUrl),
  ])

  if (!quoteRes.ok) throw new Error(`Failed to fetch quote for ${upperSymbol}`)

  const quote = await quoteRes.json()
  const profile = profileRes.ok ? await profileRes.json() : {}

  return {
    symbol: upperSymbol,
    company: profile.name || upperSymbol,
    currentPrice: quote.c ?? 0,
  }
}
