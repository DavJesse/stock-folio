'use client'

import PortfolioOverview from '@/components/PortfolioOverview'
import StockSearchBar from '@/components/SearchBar'

// Renders content of /dashboard/portfolio
export default function PortfolioPage() {
  return (
    <div className="space-y-8">
      <StockSearchBar /> {/* Render search bar at the top */}
      <PortfolioOverview />
    </div>
  )
}
