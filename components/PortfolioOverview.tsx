'use client'

import { useEffect, useState } from 'react'
import PortfolioChart from '@/components/PortfolioChart'
import PortfolioTable from '@/components/PortfolioTable'

// Data models
import { PortfolioEntry, EnrichedPortfolioEntry, PortfolioSummary } from '@/types/portfolio'
import { LiveQuote } from '@/types/stock'

// Utility functions
import mergePortfolioWithLiveQuotes from '@/lib/portfolio/merge-portfolio-with-live-quotes'
import calculatePortfolioSummary from '@/lib/portfolio/calculate-portfolio-summary'

// Placeholder fetch function — replace with your real data fetchers
async function fetchUserPortfolio(): Promise<PortfolioEntry[]> {
  const res = await fetch('/api/portfolio') 
  
  if (!res.ok) {
    throw new Error('Failed to fetch portfolio')
  } 
  
  const data = await res.json() 
  
  if (!Array.isArray(data)) {
    console.error('Expected array, got:', data)
    throw new Error('Invalid portfolio response')
  } 
  
  return data
}

async function fetchLiveQuotes(symbols: string[]): Promise<LiveQuote[]> {
  const res = await fetch(`/api/quotes?symbols=${symbols.join(',')}`)
  return res.json()
}

export default function PortfolioOverview() {
  const [portfolio, setPortfolio] = useState<EnrichedPortfolioEntry[]>([])
  const [summary, setSummary] = useState<PortfolioSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadPortfolio = async () => {
      setLoading(true)
      setError(null)

      try {
        const rawPortfolio = await fetchUserPortfolio()
        const symbols = rawPortfolio.map((entry) => entry.symbol)
        const liveQuotes = await fetchLiveQuotes(symbols)

        const enriched = mergePortfolioWithLiveQuotes(rawPortfolio, liveQuotes)
        const portfolioSummary = calculatePortfolioSummary(enriched)

        setPortfolio(enriched)
        setSummary(portfolioSummary)
      } catch (err) {
        console.error('Failed to load portfolio:', err)
        setError('Failed to load portfolio data.')
      } finally {
        setLoading(false)
      }
    }

    loadPortfolio()
  }, [])

  if (loading) return <p className="text-[var(--success-color)] text-center">Loading portfolio...</p>
  if (error) return <p className="text-[var(--warning-color)]">{error}</p>
  if (!portfolio.length || !summary) return <p className="text-gray-400">No portfolio data available.</p>

  return (
    <div className="space-y-6 lg:space-y-0 lg:grid lg:grid-cols-[1fr_400px] lg:gap-6 xl:grid-cols-[2fr_1fr]">
      {/* Table section - full width on mobile, left column on desktop */}
      <div className="order-2 lg:order-1">
        <PortfolioTable data={portfolio} summary={summary} />
      </div>
      
      {/* Chart section - full width on mobile, right column on desktop */}
      <div className="order-1 lg:order-2">
        <PortfolioChart data={portfolio} />
      </div>
    </div>
  )
}
