'use client'

import { useState, useEffect } from 'react'
import ProfileHeader from '@/components/ProfileHeader'
import PersonalInfoCard from '@/components/PersonalInfoCard'
import StockSearchBar from '@/components/SearchBar'
import { User } from '@/types/user'

// AccountManagementPage: Displays account management UI for the logged-in user.
// - Fetches authenticated user data from /api/user/me
// - Shows search bar, profile header, and personal info card
// - Displays a loading message while fetching user data
export default function AccountManagementPage() {
  // Holds the authenticated user object or null if not loaded
  const [user, setUser] = useState<User | null>(null)

  // Fetch authenticated user data on component mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/user/me')
        const data = await res.json()
        setUser(data)
      } catch (err) {
        // Log errors only if LOG_ERRORS environment variable is set to 'true'
        if (process.env.LOG_ERRORS === 'true') {
          console.error('Failed to fetch user:', err)
        }
      }
    }

    fetchUser()
  }, [])

  return (
    <div className="space-y-8">
      {/* Stock search bar */}
      <StockSearchBar />

      {user ? (
        <>
          {/* User profile header */}
          <ProfileHeader user={user} />

          {/* User personal information */}
          <PersonalInfoCard user={user} />
        </>
      ) : (
        // Loading state
        <div className="text-[var(--success-color)]">Loading...</div>
      )}
    </div>
  )
}
