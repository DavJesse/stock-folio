'use client'

// Imports
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'

import AuthFormToggle from '@/components/AuthFormToggle'

// Component: HomePage
export default function HomePage() {
  const router = useRouter()

  // Redirect to dashboard if token cookie exists
  useEffect(() => {
    const token = Cookies.get('token')
    if (token) {
      router.replace('/dashboard')
    }
  }, [router])

  // Render auth form if no token
  return (
    <div className="fixed inset-0 flex items-center justify-center p-4">
      <AuthFormToggle />
    </div>
  )
}
