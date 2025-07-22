'use client'

import Image from 'next/image'
import React, { useState } from 'react'

// Type definition for stock data
type Stock = {
  symbol: string
  name: string
}

// Props for the StockDisplay component
type Props = {
  stock: Stock | null
}

const StockDisplay: React.FC<Props> = ({ stock }) => {
  // Initialize logo source URL based on stock symbol
  const [logoSrc, setLogoSrc] = useState(
    stock ? `https://static.finnhub.io/logo/${stock.symbol}.svg` : ''
  )

  // Do not render anything if no stock is provided
  if (!stock) return null

  return (
    <div className="flex items-center space-x-4 p-4 border rounded shadow-sm">
      <Image
        src={logoSrc}
        alt={`${stock.symbol} logo`}
        width={50}
        height={50}
        onError={() => setLogoSrc('/placeholder-logo.svg')} // Fallback in case logo fails to load
        className="rounded"
      />
      <div className="flex flex-col">
        <span className="font-semibold text-lg">{stock.symbol}</span>
        <span className="text-gray-600">{stock.name}</span>
      </div>
    </div>
  )
}

export default StockDisplay
