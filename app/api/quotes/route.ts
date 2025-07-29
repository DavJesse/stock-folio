import { NextRequest, NextResponse } from 'next/server'
import { getUserFromSessionCookie } from '@/lib/security/get-user-from-session-cookie'
import { fetchQuoteAndProfile } from '@/lib/stock/fetch-quote-and-profile'

/**
 * GET /api/stocks/quotes
 *
 * Returns the current price and company name for each symbol passed
 * as a comma-separated `symbols` query parameter.
 *
 * Requirements:
 * - Authenticated session via cookie
 * - FINNHUB_API_KEY must be set in environment variables
 * - Query parameter: symbols=AAPL,MSFT,GOOG
 */
export async function GET(req: NextRequest) {
  // Authenticate the user from session cookie
  const user = await getUserFromSessionCookie(req)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Ensure API key is configured in the environment
  const apiKey = process.env.FINNHUB_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
  }

  // Parse and validate the symbols query parameter
  const url = new URL(req.url)
  const symbolsParam = url.searchParams.get('symbols')
  if (!symbolsParam) {
    return NextResponse.json({ error: 'Missing symbols parameter' }, { status: 400 })
  }

  // Split and normalize the symbols list
  const symbols = symbolsParam.split(',').map((s) => s.trim().toUpperCase())

  try {
    // Fetch stock data for each symbol concurrently
    const rawResults = await Promise.all(
      symbols.map((symbol) => fetchQuoteAndProfile(symbol, apiKey))
    )

    // Normalize the API results to a consistent shape
    const results = rawResults.map((stock) => ({
      symbol: stock.symbol,
      price: stock.currentPrice ?? 0,
      name: stock.company ?? stock.symbol,
    }))

    // Return the normalized list of stock quotes
    return NextResponse.json(results)
  } catch (err) {
    // Log error on server side and return generic error response
    console.error('Error fetching quotes:', err)
    return NextResponse.json({ error: 'Failed to fetch stock data' }, { status: 500 })
  }
}
