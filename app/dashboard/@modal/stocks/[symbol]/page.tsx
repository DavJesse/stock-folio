'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'
import StockModal from '@/components/StockModal'

export default function StockModalPage({
  params,
}: {
  params: Promise<{ symbol: string }>
}) {
  // Resolve the symbol from route params
  const { symbol } = use(params)

  // Router instance to navigate back
  const router = useRouter()

  // Handle modal close by navigating back
  const handleClose = () => {
    router.back()
  }

  return (
    <StockModal
      symbol={symbol}
      onClose={handleClose}
    />
  )
}
