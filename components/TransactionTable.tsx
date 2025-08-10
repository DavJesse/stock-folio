'use client'

import { TransactionRow } from '@/types/transaction'
import { format } from 'date-fns'
import formatCurrency from '@/lib/format/format-currency'

type Props = {
  readonly transactions: TransactionRow[]
  readonly isLoading: boolean
  readonly currentPage?: number
  readonly totalCount?: number
  readonly onPageChange?: (page: number) => void
  readonly showPagination?: boolean
}

// Returns a color depending on transaction type: green for 'buy', red for 'sell'
function getTypeColor(type: string) {
  return type === 'buy' ? '#00ff00' : '#ff4444' // green or red
}

export default function TransactionHistoryTable({
  transactions,
  isLoading,
  currentPage = 1,
  totalCount = 0,
  onPageChange,
  showPagination = true,
}: Props) {
  if (isLoading) {
    return <p className="text-[var(--success-color)] text-center py-4">Loading transactions...</p>
  }

  const totalPages = Math.ceil(totalCount / 10)
  const hasPagination = showPagination && onPageChange && totalPages > 1

  return (
    <div className="w-[95%] md:w-[66.67%] shadow-lg bg-white/5 backdrop-blur-md border-r border-white/10 rounded-lg">
      <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <h1 className="text-white font-bold text-center text-lg sm:text-xl mb-4">Transaction History</h1>

        {/* No transactions to display */}
        {transactions.length === 0 ? (
          <p className="text-white text-center py-8">No transactions found.</p>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="min-w-full table-auto border-collapse border border-gray-700 text-sm text-left text-white">
                <thead className="bg-[var(--primary-background)] text-xs uppercase">
                  <tr>
                    <th className="px-4 py-2 border border-gray-700">Date</th>
                    <th className="px-4 py-2 border border-gray-700">Symbol</th>
                    <th className="px-4 py-2 border border-gray-700">Type</th>
                    <th className="px-4 py-2 border border-gray-700">Quantity</th>
                    <th className="px-4 py-2 border border-gray-700">Price</th>
                    <th className="px-4 py-2 border border-gray-700">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx, idx) => (
                    <tr key={`${tx.symbol}-${tx.created_at}-${idx}`} className="border-t border-gray-700">
                      <td className="px-4 py-2 border border-gray-700">
                        {format(new Date(tx.created_at), 'yyyy-MM-dd HH:mm')}
                      </td>
                      <td className="px-4 py-2 border border-gray-700">{tx.symbol}</td>
                      <td
                        className="px-4 py-2 border border-gray-700 font-medium"
                        style={{ color: getTypeColor(tx.type) }}
                      >
                        {tx.type.toUpperCase()}
                      </td>
                      <td className="px-4 py-2 border border-gray-700">{tx.quantity}</td>
                      <td className="px-4 py-2 border border-gray-700">{formatCurrency(tx.price)}</td>
                      <td className="px-4 py-2 border border-gray-700">
                        {formatCurrency(tx.quantity * tx.price)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden space-y-4">
              {transactions.map((tx, idx) => (
                <div
                  key={`${tx.symbol}-${tx.created_at}-${idx}`}
                  className="bg-white/10 rounded-lg p-4 border border-gray-700"
                >
                  <div className="flex justify-between mb-2">
                    <div>
                      <h3 className="text-white font-bold text-lg">{tx.symbol}</h3>
                      <p className="text-gray-300 text-sm">{format(new Date(tx.created_at), 'PPpp')}</p>
                    </div>
                    <div
                      className="text-right font-bold text-lg"
                      style={{ color: getTypeColor(tx.type) }}
                    >
                      {tx.type.toUpperCase()}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm text-white">
                    <div>
                      <div className="text-gray-400">Quantity</div>
                      <div>{tx.quantity}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Price</div>
                      <div>{formatCurrency(tx.price)}</div>
                    </div>
                    <div className="col-span-2">
                      <div className="text-gray-400">Total</div>
                      <div className="font-semibold">{formatCurrency(tx.quantity * tx.price)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {hasPagination && (
              <div className="flex justify-center mt-6 space-x-4">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    onPageChange(currentPage - 1)
                  }}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-gray-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
                >
                  Previous
                </button>
                <span className="text-white px-4 py-2">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    onPageChange(currentPage + 1)
                  }}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-gray-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
