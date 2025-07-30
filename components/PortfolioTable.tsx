'use client'

import { EnrichedPortfolioEntry, PortfolioSummary } from '@/types/portfolio'
import getGainLossColor from '@/lib/portfolio/gain-loss-color'

type Props = {
  data: EnrichedPortfolioEntry[]
  summary: PortfolioSummary
}

export default function PortfolioTable({ data, summary }: Props) {
  const gainLossPercent = summary.totalCost === 0 ? 0 : (summary.totalGainLoss / summary.totalCost) * 100

  return (
    <div className="shadow-lg bg-white/5 backdrop-blur-md border-r border-white/10 rounded-lg">
      <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <h1 className="text-white font-bold text-center text-lg sm:text-xl mb-4">Portfolio Summary Table</h1>
        
        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="min-w-full table-auto border-collapse border border-gray-700 text-sm text-left text-white">
            <thead className="bg-[var(--primary-background)] text-xs uppercase">
              <tr>
                <th className="px-4 py-2 border border-gray-700">Symbol</th>
                <th className="px-4 py-2 border border-gray-700">Company</th>
                <th className="px-4 py-2 border border-gray-700">Qty</th>
                <th className="px-4 py-2 border border-gray-700">Initial Price</th>
                <th className="px-4 py-2 border border-gray-700">Live Price</th>
                <th className="px-4 py-2 border border-gray-700">Total Cost</th>
                <th className="px-4 py-2 border border-gray-700">Current Value</th>
                <th className="px-4 py-2 border border-gray-700">Gain/Loss</th>
              </tr>
            </thead>
            <tbody>
              {data.map((entry) => (
                <tr key={entry.symbol} className="border-t border-gray-700">
                  <td className="px-4 py-2 border border-gray-700">{entry.symbol}</td>
                  <td className="px-4 py-2 border border-gray-700">{entry.company}</td>
                  <td className="px-4 py-2 border border-gray-700">{entry.quantity}</td>
                  <td className="px-4 py-2 border border-gray-700">${entry.initialPrice.toFixed(2)}</td>
                  <td className="px-4 py-2 border border-gray-700">${entry.currentPrice.toFixed(2)}</td>
                  <td className="px-4 py-2 border border-gray-700">${entry.totalCost.toFixed(2)}</td>
                  <td className="px-4 py-2 border border-gray-700">${entry.currentValue.toFixed(2)}</td>
                  <td
                    className="px-4 py-2 border border-gray-700 font-semibold"
                    style={{ color: getGainLossColor(entry.gainLoss) }}
                  >
                    ${entry.gainLoss.toFixed(2)} ({entry.gainLossPercent.toFixed(2)}%)
                  </td>
                </tr>
              ))}

              {/* Totals row */}
              <tr className="bg-gray-900 font-bold border-t border-gray-700">
                <td colSpan={5} className="px-4 py-2 border border-gray-700 text-right">Total</td>
                <td className="px-4 py-2 border border-gray-700">${summary.totalCost.toFixed(2)}</td>
                <td className="px-4 py-2 border border-gray-700">${summary.totalValue.toFixed(2)}</td>
                <td
                  className="px-4 py-2 border border-gray-700"
                  style={{ color: getGainLossColor(summary.totalGainLoss) }}
                >
                  ${summary.totalGainLoss.toFixed(2)} ({gainLossPercent.toFixed(2)}%)
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="lg:hidden space-y-4">
          {data.map((entry) => (
            <div key={entry.symbol} className="bg-white/10 rounded-lg p-4 border border-gray-700">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-white font-bold text-lg">{entry.symbol}</h3>
                  <p className="text-gray-300 text-sm truncate">{entry.company}</p>
                </div>
                <div className="text-right">
                  <div
                    className="font-bold text-lg"
                    style={{ color: getGainLossColor(entry.gainLoss) }}
                  >
                    ${entry.gainLoss.toFixed(2)}
                  </div>
                  <div
                    className="text-sm"
                    style={{ color: getGainLossColor(entry.gainLoss) }}
                  >
                    ({entry.gainLossPercent.toFixed(2)}%)
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-400">Quantity:</span>
                  <div className="text-white font-medium">{entry.quantity}</div>
                </div>
                <div>
                  <span className="text-gray-400">Current Price:</span>
                  <div className="text-white font-medium">${entry.currentPrice.toFixed(2)}</div>
                </div>
                <div>
                  <span className="text-gray-400">Total Cost:</span>
                  <div className="text-white font-medium">${entry.totalCost.toFixed(2)}</div>
                </div>
                <div>
                  <span className="text-gray-400">Current Value:</span>
                  <div className="text-white font-medium">${entry.currentValue.toFixed(2)}</div>
                </div>
              </div>
            </div>
          ))}

          {/* Mobile Summary Card */}
          <div className="bg-gray-900 rounded-lg p-4 border-2 border-gray-600 mt-6">
            <h3 className="text-white font-bold text-lg mb-3 text-center">Portfolio Total</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-gray-400 text-sm">Total Cost</div>
                <div className="text-white font-bold text-lg">${summary.totalCost.toFixed(2)}</div>
              </div>
              <div className="text-center">
                <div className="text-gray-400 text-sm">Current Value</div>
                <div className="text-white font-bold text-lg">${summary.totalValue.toFixed(2)}</div>
              </div>
            </div>
            <div className="text-center mt-4 pt-4 border-t border-gray-700">
              <div className="text-gray-400 text-sm">Total Gain/Loss</div>
              <div
                className="font-bold text-xl"
                style={{ color: getGainLossColor(summary.totalGainLoss) }}
              >
                ${summary.totalGainLoss.toFixed(2)} ({gainLossPercent.toFixed(2)}%)
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
