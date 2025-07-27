import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const token = req.cookies.get('token')?.value
  const { pathname } = req.nextUrl

  // If user is logged in and tries to access '/', redirect to '/dashboard'
  if (pathname === '/' && token) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  // If user is not logged in and tries to access '/dashboard', redirect to '/'
  const isProtected = pathname.startsWith('/dashboard')
  if (isProtected && !token) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  // Otherwise allow the request to continue
  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/dashboard/:path*'],
}
