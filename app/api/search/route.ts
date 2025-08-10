import { NextRequest, NextResponse } from 'next/server'
import { getUserFromSessionCookie } from '@/lib/security/get-user-from-session-cookie'

interface FinnhubSearchResult {
  description: string
  displaySymbol: string
  symbol: string
  type: string
}

/**
 * GET handler for stock search endpoint.
 * Accepts a query parameter `q`, validates it, and forwards the request to the Finnhub API.
 */
export async function GET(req: NextRequest) {
  // Authenticate user
  const user = await getUserFromSessionCookie(req)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const query = searchParams.get('q')?.trim().toUpperCase()

  // Return 400 if no query is provided
  if (!query) {
    return NextResponse.json(
      { error: 'Missing search query' },
      { status: 400 }
    )
  }

  const apiKey = process.env.FINNHUB_API_KEY

  // Return 500 if the API key is not configured on the server
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Missing server API key' },
      { status: 500 }
    )
  }

  try {
    // Fetch matching stocks from the Finnhub API
    const res = await fetch(`https://finnhub.io/api/v1/search?q=${query}&token=${apiKey}`)

    // Return error if the API request failed
    if (!res.ok) {
      return NextResponse.json(
        { error: 'Finnhub API request failed' },
        { status: res.status }
      )
    }

    const data = await res.json()

    // Filter out stocks with a dot in the symbol (e.g., ETFs)
    const filteredResults = (data.result as FinnhubSearchResult[]).filter(
      (stock) => !stock.symbol.includes('.')
    )

    // Return successful result from the API
    return NextResponse.json({ result: filteredResults }, { status: 200 })
    
  } catch (error) {
    // Log and return internal error
    if (process.env.LOG_ERRORS === 'true') {
    console.error('Error fetching stock data:', error)
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
