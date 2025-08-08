'use client'

// Imports
import { useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useAccountBalance } from '@/hooks/use-account-balance'
import DemoPopup from '@/components/DemoPopup'
import formatCurrency from '@/lib/format/format-currency'

// Icons
import {
  Home,
  BarChart,
  Wallet,
  User,
  LogOut,
  Menu,
  X,
} from 'lucide-react'

// Props interface
interface DashboardLayoutProps {
  readonly children: ReactNode
}

// Component: DashboardLayout
export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { balance, loading } = useAccountBalance()

  // Handle logout and redirect to home
  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
  }

  // Toggle sidebar visibility (mobile)
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  // Close sidebar when clicking backdrop
  const closeSidebar = () => {
    setSidebarOpen(false)
  }

  return (
    <div className="flex min-h-screen relative">
      {/* Mobile: Hamburger menu toggle - FIXED positioning */}
      <button
        className="fixed top-4 left-4 z-50 lg:hidden bg-white/10 backdrop-blur-md p-2 rounded-md border border-white/20 text-white hover:bg-white/20 transition-colors"
        onClick={toggleSidebar}
        aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile backdrop overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar - FIXED positioning for mobile */}
      <aside
        className={`
          fixed z-40 top-0 left-0
          lg:relative lg:m-2 h-screen lg:h-[96vh] lg:my-[2vh]
          w-64 py-9 px-4
          flex flex-col justify-between
          lg:rounded-r-lg
          shadow-lg bg-white/5 backdrop-blur-md border-r border-white/10
          text-white
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
          lg:translate-x-0
        `}
      >
        {/* Sidebar content */}
        <div className="mt-8">
          <nav className="space-y-16">
            {/* Main menu */}
            <div>
              <h2 className="text-white font-bold px-2">MAIN MENU</h2>
              <ul className="space-y-2 mt-2">
                <li>
                  <a 
                    href="/dashboard" 
                    className="flex items-center gap-2 text-white px-2 py-1 hover:bg-white/10 rounded transition-colors"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Home size={18} /> Home
                  </a>
                </li>
                <li>
                  <a 
                    href="/dashboard/portfolio" 
                    className="flex items-center gap-2 text-white px-2 py-1 hover:bg-white/10 rounded transition-colors"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <BarChart size={18} /> Portfolio Summary
                  </a>
                </li>
                <li>
                  <a 
                    href="/dashboard/transactions" 
                    className="flex items-center gap-2 text-white px-2 py-1 hover:bg-white/10 rounded transition-colors"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Wallet size={18} /> Transactions
                  </a>
                </li>
                <li>
                  <a 
                    href="/dashboard/account-management" 
                    className="flex items-center gap-2 text-white px-2 py-1 hover:bg-white/10 rounded transition-colors"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <User size={18} /> Account Management
                  </a>
                </li>
              </ul>
            </div>

            {/* Accounts menu */}
            <div>
              <h2 className="text-white font-bold mt-6 px-2">ACCOUNT BALANCE</h2>
              <ul className="space-y-2 mt-2">
                <li>
                  <div className="flex items-center gap-2 font-bold text-[20px] text-[var(--success-color)] px-4">
                    {loading ? 'Loading...' : formatCurrency(balance ?? 0)}
                  </div>
                </li>
              </ul>
            </div>
          </nav>
        </div>

        {/* Logout button */}
        <div className="px-2">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-[var(--button-primary)] text-white hover:scale-105 py-2 px-4 rounded transition-transform"
          >
            <LogOut size={18} /> Log Out
          </button>
        </div>
      </aside>

      {/* Main content area */}
      <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto w-full lg:ml-0">
        <DemoPopup /> {/* Render DemoPopup if localStorage has demoMessage */}
        {children}
      </main>
    </div>
  )
}
