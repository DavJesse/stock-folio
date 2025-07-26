'use client'

import { useEffect, useState } from 'react'
import formatCurrency from '@/lib/format/format-currency'

type Stock = {
  name: string
  symbol: string
  price: number
  change: number
  changePercent: number
  high: number
  low: number
  open: number
  previousClose: number
}

type StockModalProps = {
  readonly symbol: string
  readonly onClose: () => void
}

export default function StockModal({ symbol, onClose }: StockModalProps) {
  const [stock, setStock] = useState<Stock | null>(null)
  const [accountBalance, setAccountBalance] = useState<number | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [currentPrice, setCurrentPrice] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  /** Load initial stock data and account balance */
  useEffect(() => {
    fetch(`/api/stocks/${symbol}`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then(data => {
        const basePrice = data.c ?? data.price ?? 0
        setStock({
          name: data.name ?? symbol,
          symbol: data.symbol ?? symbol,
          price: basePrice,
          change: data.d ?? 0,
          changePercent: data.dp ?? 0,
          high: data.h ?? 0,
          low: data.l ?? 0,
          open: data.o ?? 0,
          previousClose: data.pc ?? 0,
        })
        setCurrentPrice(basePrice)
      })
      .catch(err => {
        console.error('Error fetching stock:', err)
        // Display placeholder stock to allow modal render
        setStock({
          name: symbol,
          symbol,
          price: 0,
          change: 0,
          changePercent: 0,
          high: 0,
          low: 0,
          open: 0,
          previousClose: 0,
        })
      })

    fetch(`/api/account/balance`, { credentials: 'include' })
      .then(res => (res.ok ? res.json() : null))
      .then(data => data && setAccountBalance(data.cash_balance))
      .catch(() => {
        // Ignore missing endpoint or network failures
      })
  }, [symbol])

  /** Poll price every 10 seconds to update live value */
  useEffect(() => {
    const interval = setInterval(() => {
      fetch(`/api/stocks/${symbol}`)
        .then(res => res.json())
        .then(data => {
          const newPrice = data.c ?? data.price
          setCurrentPrice(newPrice)
          setStock(prev =>
            prev ? { ...prev, price: newPrice } : null
          )
        })
        .catch(err => console.error('Error updating price:', err))
    }, 10_000)

    return () => clearInterval(interval)
  }, [symbol])

  if (!stock) {
    // Show loading overlay while initial data loads
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm">
        <div className="bg-white p-6 rounded-lg">
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  const isPositive = stock.change >= 0
  const costPer = currentPrice ?? stock.price
  const totalCost = costPer * quantity
  const canAfford = accountBalance == null || accountBalance >= totalCost

  /** Common logic to handle buy or sell submission */
  async function handleTrade(action: 'buy' | 'sell') {
    if (!stock || currentPrice == null) return

    setIsLoading(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const csrfRes = await fetch('/api/auth/csrf-token')
      if (!csrfRes.ok) throw new Error('Failed to get CSRF token')
      const { csrfToken } = await csrfRes.json()

      const res = await fetch(`/api/transactions/${action}`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
        },
        body: JSON.stringify({
          symbol: stock.symbol,
          quantity,
          price: costPer,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? `Failed to ${action} stock`)

      setSuccessMessage(
        `Successfully ${action === 'buy' ? 'bought' : 'sold'} ${quantity} share${
          quantity !== 1 ? 's' : ''
        } of ${stock.symbol}!`
      )

      const balRes = await fetch('/api/account/balance', { credentials: 'include' })
      if (balRes.ok) {
        const bal = await balRes.json()
        setAccountBalance(bal.cash_balance)
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-[var(--primary-brackground)]/50 z-50 flex items-center justify-center backdrop-blur-sm">
      <div className="bg-white p-6 rounded-lg max-w-lg w-full mx-4 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl"
          aria-label="Close modal"
        >
          ×
        </button>

        {/* Stock details */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-1">{stock.name}</h2>
          <p data-testid="stock-symbol" className="text-gray-600 text-sm">
            {stock.symbol}
          </p>
        </div>

        {/* Stock price and change */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Current Price</h3>
            <p data-testid="current-stock-price" className="text-3xl font-bold">
              {formatCurrency(costPer)}
            </p>
            <p className={`text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isPositive ? '+' : ''}
              {stock.change.toFixed(2)} (
              {isPositive ? '+' : ''}
              {stock.changePercent.toFixed(2)}%)
            </p>
          </div>

          {/* Daily range details */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Daily Range</h3>
            <div className="space-y-1 text-sm">
              <p>
                <span className="text-gray-600">High:</span> ${stock.high.toFixed(2)}
              </p>
              <p>
                <span className="text-gray-600">Low:</span> ${stock.low.toFixed(2)}
              </p>
              <p>
                <span className="text-gray-600">Open:</span> ${stock.open.toFixed(2)}
              </p>
              <p>
                <span className="text-gray-600">Prev Close:</span> ${stock.previousClose.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* Account balance and trade options */}
        {accountBalance != null && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600">Account Balance</p>
            <p className="text-lg font-semibold">{formatCurrency(accountBalance)}</p>
            {!canAfford && (
              <p className="text-red-600 text-sm mt-1">
                Insufficient funds for this purchase
              </p>
            )}
          </div>
        )}

        {/* Error container */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Success message container */}
        {successMessage && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-700 text-sm">{successMessage}</p>
          </div>
        )}

        {/* Trade form */}
        <div className="border-t pt-4">
          <h3 className="text-lg font-semibold mb-3">Trade</h3>
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity
              </label>
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={e =>
                  setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                }
                data-testid="quantity-input"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-center"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Cost
              </label>
              <p className="text-lg font-semibold py-2">
                {formatCurrency(totalCost)}
              </p>
            </div>
          </div>

          {/* Trade action buttons */}
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => handleTrade('buy')}
              disabled={isLoading || !canAfford || !stock}
              className={`flex-1 py-3 px-4 rounded-md font-medium transition-colors text-white ${
                isLoading || !canAfford
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {isLoading ? 'Processing...' : `Buy ${quantity} Share${quantity !== 1 ? 's' : ''}`}
            </button>
            <button
              onClick={() => handleTrade('sell')}
              disabled={isLoading || !stock}
              className={`flex-1 py-3 px-4 rounded-md font-medium transition-colors text-white ${
                isLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {isLoading ? 'Processing...' : `Sell ${quantity} Share${quantity !== 1 ? 's' : ''}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
