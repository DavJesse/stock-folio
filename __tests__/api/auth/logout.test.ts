import { POST as logoutHandler } from '@/app/api/auth/logout/route'
import { NextResponse } from 'next/server'

describe('Logout API', () => {
  it('clears the auth token cookie and returns 200', async () => {
    // Call the logout handler
    const res = await logoutHandler()

    // Response should be an instance of NextResponse
    expect(res).toBeInstanceOf(NextResponse)

    // Token cookie should be cleared
    const cookie = res.cookies.get('token')
    expect(cookie?.value).toBe('')

    // Cookie should expire immediately
    if (cookie?.expires instanceof Date) {
      expect(cookie.expires.getTime()).toBe(new Date(0).getTime())
    } else {
      throw new Error('Expected cookie.expires to be a Date instance')
    }

    // Check status and response message
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ message: 'Logged out successfully.' })
  })
})
