'use client'

import { useState, useEffect } from 'react'
import PortfolioOverview from '@/components/PortfolioOverview'
import TransactionHistoryTable from '@/components/TransactionTable'
import { TransactionRow } from '@/types/transaction'

export default function DashboardPage() {
  const [transactions, setTransactions] = useState<TransactionRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  
  const limit = 10 // Number of transactions per page

  // Fetches a page of transaction history from the API
  const fetchTransactions = async (page: number) => {
    setIsLoading(true)
    try {
      const offset = (page - 1) * limit // Calculate offset for pagination
      const res = await fetch(`/api/transactions/history?limit=${limit}&offset=${offset}`, {
        cache: 'no-store', // Ensure fresh data on each request
      })
      
      if (!res.ok) {
        throw new Error('Failed to fetch transactions')
      }
      
      const data = await res.json()
      setTransactions(data.transactions || []) // Fallback to empty array if undefined
      setTotalCount(data.total || 0)
    } catch (error) {
      console.error('Failed to fetch transactions:', error)
      setTransactions([])
      setTotalCount(0)
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch transactions whenever the page changes
  useEffect(() => {
    fetchTransactions(currentPage)
  }, [currentPage])

  // Handles user pagination interaction
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  return (
    <div>
      <h1 className="flex flex-col gap-7 text-2xl text-white font-bold mt-10 lg:mt-0">
        Welcome to your Dashboard
      </h1>
      <PortfolioOverview />
      <TransactionHistoryTable
        transactions={transactions}
        isLoading={isLoading}
        currentPage={currentPage}
        totalCount={totalCount}
        onPageChange={handlePageChange}
      />
    </div>
  )
}