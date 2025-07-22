'use client'

// Imports
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ReactNode } from 'react'
import StockSearchBar from '@/components/SearchBar'

// Icons
import {
  Home,
  BarChart,
  Wallet,
  DollarSign,
  Users,
  HelpCircle,
  LogOut,
  Menu,
  X,
} from 'lucide-react'

// Props interface
interface DashboardLayoutProps {
  children: ReactNode
}

// Component: DashboardLayout
export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Handle logout and redirect to home
  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
  }

  // Toggle sidebar visibility (mobile)
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  return (
    <div className="flex min-h-screen relative">
      {/* Mobile: Hamburger menu toggle */}
      <button
        className="absolute top-4 left-4 z-50 lg:hidden bg-white/10 backdrop-blur-md p-2 rounded-md border border-white/20 text-white"
        onClick={toggleSidebar}
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`
          fixed z-40 top-0 left-0
          lg:m-2 h-screen lg:h-[96vh] lg:my-[2vh]
          w-64 py-9 px-4
          flex flex-col justify-between
          rounded-r-lg
          shadow-lg bg-white/5 backdrop-blur-md border-r border-white/10
          text-white
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
          lg:static lg:translate-x-0
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
                  <a href="#" className="flex items-center gap-2 text-white px-2 py-1">
                    <Home size={18} /> Home
                  </a>
                </li>
                <li>
                  <a href="#" className="flex items-center gap-2 text-white px-2 py-1">
                    <BarChart size={18} /> Exchange
                  </a>
                </li>
                <li>
                  <a href="#" className="flex items-center gap-2 text-white px-2 py-1">
                    <Wallet size={18} /> Wallets
                  </a>
                </li>
                <li>
                  <a href="#" className="flex items-center gap-2 text-white px-2 py-1">
                    <DollarSign size={18} /> Crypto
                  </a>
                </li>
              </ul>
            </div>

            {/* Support menu */}
            <div>
              <h2 className="text-white font-bold mt-6 px-2">SUPPORT</h2>
              <ul className="space-y-2 mt-2">
                <li>
                  <a href="#" className="flex items-center gap-2 text-white px-2 py-1">
                    <Users size={18} /> Community
                  </a>
                </li>
                <li>
                  <a href="#" className="flex items-center gap-2 text-white px-2 py-1">
                    <HelpCircle size={18} /> Help & Support
                  </a>
                </li>
              </ul>
            </div>
          </nav>
        </div>

        {/* Logout button */}
        <div className="px-2">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-[var(--button-primary)] text-white hover:scale-105 py-2 px-4 rounded"
          >
            <LogOut size={18} /> Log Out
          </button>
        </div>
      </aside>

      {/* Main content area */}
      <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto w-full">
        <StockSearchBar />
        {children}
      </main>
    </div>
  )
}
