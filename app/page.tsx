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
      console.log('User already authenticated, redirecting to dashboard...')
      router.replace('/dashboard')
    }
  }, [router])

  // Render auth form if no token
  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <AuthFormToggle />
    </div>
  )
}
