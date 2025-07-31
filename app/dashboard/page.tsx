'use client'

import StockSearchBarLarge from "@/components/LargeSearchBar"

export default function DashboardPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
      {/* Prominent heading - Google-style */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-light text-white mb-4 tracking-tight">
          Search your stock,
        </h1>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-light text-white mb-8 tracking-tight">
          <span className="text-blue-400">start trading</span>...
        </h1>
      </div>
      
      {/* Large Search Bar */}
      <div className="w-full max-w-4xl">
        <StockSearchBarLarge />
      </div>
      
      {/* Optional: Quick suggestions or popular stocks */}
      <div className="mt-16 text-center">
        <p className="text-gray-500 text-sm mb-4">Popular searches:</p>
        <div className="flex flex-wrap justify-center gap-3">
          {['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'AMZN', 'NVDA'].map((symbol) => (
            <div
              key={symbol}
              className="px-4 py-2 bg-white/5 text-gray-300 rounded-full text-sm transition-all duration-200"
            >
              {symbol}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
