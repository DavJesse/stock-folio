'use client'

import { useState, useEffect } from 'react'
import TransactionHistoryTable from '@/components/TransactionTable'
import { TransactionRow } from '@/types/transaction'
import StockSearchBar from '@/components/SearchBar'

export default function TransactionsPage() {
  // State to store fetched transactions
  const [transactions, setTransactions] = useState<TransactionRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  const limit = 10

  // Fetch paginated transactions from API
  const fetchTransactions = async (page: number) => {
    setIsLoading(true)
    try {
      const offset = (page - 1) * limit
      const res = await fetch(`/api/transactions/history?limit=${limit}&offset=${offset}`, {
        cache: 'no-store',
      })
      const data = await res.json()
      setTransactions(data.transactions || [])
      setTotalCount(data.total || 0)
    } catch (err) {
      console.error(err)
      setTransactions([])
      setTotalCount(0)
    } finally {
      setIsLoading(false)
    }
  }

  // Refetch data when the page changes
  useEffect(() => {
    fetchTransactions(currentPage)
  }, [currentPage])

  const handlePageChange = (page: number) => setCurrentPage(page)

  return (
    <div className="flex flex-col gap-6">
      <StockSearchBar /> {/* Render search bar at the top */}
      <div className="flex justify-center">
        <TransactionHistoryTable
          transactions={transactions}
          isLoading={isLoading}
          currentPage={currentPage}
          totalCount={totalCount}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  )
}
