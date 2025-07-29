import { getUserFromSessionCookie } from '@/lib/security/get-user-from-session-cookie'
import { getUserIdFromSession } from '@/db/models/sessions'
import { NextRequest } from 'next/server'

// Mock the DB call
jest.mock('@/db/models/sessions', () => ({
  getUserIdFromSession: jest.fn(),
}))

describe('getUserFromSessionCookie', () => {
  const mockSessionId = 'abc123'

  function createMockRequestWithCookie(sessionId: string): NextRequest {
    const url = 'http://localhost/api/account/balance'
    return new NextRequest(url, {
      method: 'GET',
      headers: {
        cookie: `token=${sessionId}`,
      },
    })
  }

  it('returns userId if session is valid', async () => {
    (getUserIdFromSession as jest.Mock).mockResolvedValue(456)

    const req = createMockRequestWithCookie(mockSessionId)
    const result = await getUserFromSessionCookie(req)

    expect(result).toEqual({ userId: 456 })
    expect(getUserIdFromSession).toHaveBeenCalledWith(mockSessionId)
  })

  it('returns undefined if no token cookie is present', async () => {
    const req = new NextRequest('http://localhost')
    const result = await getUserFromSessionCookie(req)

    expect(result).toBeUndefined()
  })

  it('returns undefined if session is invalid', async () => {
    (getUserIdFromSession as jest.Mock).mockResolvedValue(undefined)

    const req = createMockRequestWithCookie('invalid-session-id')
    const result = await getUserFromSessionCookie(req)

    expect(result).toBeUndefined()
  })
})
