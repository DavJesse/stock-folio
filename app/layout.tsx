// Import global CSS styles — applies to the entire app
import './globals.css'

/**
 * Metadata used by Next.js for SEO and document head generation.
 * This object is used internally by the framework (e.g. <Head /> injection).
 */
export const metadata = {
  title: 'StockFolio',
  description: 'Lantel Github assessment by David Jesse Odhiambo',
    icons: {
    icon: "/favicon.ico",
  },
}

/**
 * Root layout component that wraps all pages.
 * Placed in `app/layout.tsx` to define global structure like <html> and <body>.
 */
export default function RootLayout({
  children,
}: {
  readonly children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
