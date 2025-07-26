import { NextRequest } from 'next/server'

// Quote data returned from /quote endpoint
type QuoteData = {
  c: number // current price
  d: number // change
  dp: number // change percent
  h: number // high
  l: number // low
  o: number // open
  pc: number // previous close
  t: number // timestamp
}

// Company profile returned from /stock/profile2
type ProfileData = {
  name?: string
  country?: string
  currency?: string
  exchange?: string
  logo?: string
  weburl?: string
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ symbol: string }> }
) {
  try {
    const { symbol } = await params
    const upperSymbol = symbol.toUpperCase()
    const apiKey = process.env.FINNHUB_API_KEY

    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'API key not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const quoteUrl = `https://finnhub.io/api/v1/quote?symbol=${upperSymbol}&token=${apiKey}`
    const profileUrl = `https://finnhub.io/api/v1/stock/profile2?symbol=${upperSymbol}&token=${apiKey}`

    const [quoteRes, profileRes] = await Promise.all([
      fetch(quoteUrl),
      fetch(profileUrl),
    ])

    if (!quoteRes.ok) {
      return new Response(JSON.stringify({ error: 'Failed to fetch quote' }), {
        status: quoteRes.status,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const quote: QuoteData = await quoteRes.json()
    const profile: ProfileData = profileRes.ok ? await profileRes.json() : {}

    const stockData = {
      symbol: upperSymbol,
      name: profile.name || upperSymbol,
      c: quote.c || 0,
      price: quote.c || 0,
      d: quote.d || 0,
      dp: quote.dp || 0,
      h: quote.h || 0,
      l: quote.l || 0,
      o: quote.o || 0,
      pc: quote.pc || 0,
      ...(profile.country && {
        country: profile.country,
        currency: profile.currency,
        exchange: profile.exchange,
        logo: profile.logo,
        weburl: profile.weburl,
      }),
    }

    return new Response(JSON.stringify(stockData), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('Error fetching stock data:', err)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
