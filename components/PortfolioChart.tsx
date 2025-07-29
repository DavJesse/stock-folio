'use client'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { EnrichedPortfolioEntry } from '@/types/portfolio'

// Define a set of distinct colors for pie slices
const COLORS = [
  '#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#8dd1e1',
  '#a4de6c', '#d0ed57', '#d88884', '#84d8c2', '#c284d8',
]

type Props = {
  data: EnrichedPortfolioEntry[]
}

/**
 * Renders a responsive pie chart to visualize portfolio distribution
 * based on the `currentValue` of each stock in the user's holdings.
 */
export default function PortfolioChart({ data }: Props) {
  // Calculate total portfolio value
  const totalValue = data.reduce((sum, entry) => sum + entry.currentValue, 0)

  // Transform portfolio data into chart-friendly format
  const chartData = data.map((entry) => ({
    name: entry.company,                                          // Company name
    value: entry.currentValue,                                    // Slice size in dollars
    symbol: entry.symbol,                                         // Ticker symbol (e.g. AAPL)
    percent: ((entry.currentValue / totalValue) * 100).toFixed(2),// % of portfolio
  }))

  return (
    <div className="w-full py-4 shadow-lg bg-white/5 backdrop-blur-md border-r border-white/10 rounded-lg">
      <h1 className="text-white font-bold text-center text-xl mb-4 px-4">Portfolio Summary Chart</h1>
      
      {/* Mobile-first responsive container */}
      <div className="h-[300px] sm:h-[350px] md:h-[400px] lg:h-[450px] px-2 sm:px-4">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="symbol"
              cx="50%"
              cy="50%"
              // Responsive outer radius
              outerRadius="40%"
              // Simplified labels for mobile
              label={({ symbol, percent }) => 
                window.innerWidth < 640 ? `${symbol}` : `${symbol}: ${percent}%`
              }
              labelLine={true}
              // Smaller font size for mobile labels
              style={{ fontSize: window.innerWidth < 640 ? '10px' : '12px' }}
            >
              {/* Render one color per slice, cycling through COLORS array */}
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>

            {/* Tooltip shows exact dollar value and company name on hover */}
            <Tooltip
              formatter={(value, name, entry) => {
                return [`\$${Number(value).toLocaleString()}`, entry.payload.name]
              }}
              contentStyle={{
                backgroundColor: 'rgba(31, 42, 70, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '6px',
                color: 'white',
                fontSize: '12px'
              }}
              labelStyle={{
                color: 'white'
              }}
              itemStyle={{
                color: 'white'
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      {/* Mobile legend alternative - show on screens smaller than md (768px) */}
      <div className="block md:hidden px-4 mt-4">
        <div className="text-white text-xs space-y-1">
          {chartData.map((entry, index) => (
            <div key={entry.symbol} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-sm flex-shrink-0"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="truncate">
                {entry.symbol}: {entry.percent}% (${Number(entry.value).toLocaleString()})
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}