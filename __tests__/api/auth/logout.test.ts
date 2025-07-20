// Imports
import { POST as logoutHandler } from '@/app/api/auth/logout/route'
import { NextRequest, NextResponse } from 'next/server'
import { createMocks } from 'node-mocks-http'

/**
 * Creates a mock NextRequest with necessary CSRF token and cookies
 *
 * @param csrfToken - CSRF token to be used for both header and cookie
 * @returns Mocked NextRequest object
 */
function createMockNextRequest(csrfToken: string): NextRequest {
  const { req } = createMocks({
    method: 'POST',
    headers: {
      'x-csrf-token': csrfToken,
      cookie: `csrfToken=${csrfToken}; token=abc123`,
    },
  })

  const url = 'http://localhost/api/auth/logout'
  return new NextRequest(
    new Request(url, {
      method: 'POST',
      headers: req.headers as HeadersInit,
    })
  )
}

describe('Logout API', () => {
  it('clears the auth token cookie and returns 200', async () => {
    const csrfToken = 'valid-csrf-token'
    const req = createMockNextRequest(csrfToken)

    const res = await logoutHandler(req)

    // Expect response to be an instance of NextResponse
    expect(res).toBeInstanceOf(NextResponse)

    // Expect auth token cookie to be cleared
    const cookie = res.cookies.get('token')
    expect(cookie?.value).toBe('')

    // Expect expiration date to be epoch
    if (cookie?.expires instanceof Date) {
      expect(cookie.expires.getTime()).toBe(new Date(0).getTime())
    } else {
      throw new Error('Expected cookie.expires to be a Date instance')
    }

    // Expect 200 OK status and success message
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ message: 'Logged out successfully.' })
  })
})
