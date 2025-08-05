import { useEffect, useState } from 'react'

/**
 * Custom hook to fetch and return the user's account balance.
 * Returns the current balance and loading state.
 */
export function useAccountBalance() {
  const [balance, setBalance] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const res = await fetch('/api/account/balance') // Fetch account balance from backend
        if (!res.ok) throw new Error('Failed to fetch balance')
        const data = await res.json()
        setBalance(data.cash_balance) // Set the retrieved cash balance
      } catch (err) {
        if (process.env.LOG_ERRORS === 'true') {
          console.error(err) // Log any fetch or parsing errors
        }
        
      } finally {
        setLoading(false) // Mark loading as complete
      }
    }

    fetchBalance() // Trigger fetch on mount
  }, [])

  return { balance, loading }
}
