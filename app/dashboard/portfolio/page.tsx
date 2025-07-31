'use client'

import PortfolioOverview from '@/components/PortfolioOverview'
import StockSearchBar from '@/components/SearchBar'

// Renders content of /dashboard/portfolio
export default function PortfolioPage() {
  return (
    <div>
      <StockSearchBar /> {/* Render search bar at the top */}
      <h1 className="text-2xl text-white font-bold mt-10">Portfolio Overview</h1>
      <PortfolioOverview />
    </div>
  )
}
