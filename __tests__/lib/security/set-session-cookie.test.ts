import { setSessionCookie } from '@/lib/security/set-session-cookie'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

// Mock cookies function from next/headers
jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}))

// Mocks to track calls
const mockSet = jest.fn()
const mockCookies = cookies as jest.Mock

describe('setSessionCookie', () => {
  const originalEnv = process.env

  beforeEach(() => {
    // Set test JWT secret and replace cookies mock
    process.env = { ...originalEnv, JWT_SECRET: 'test-secret' }
    mockCookies.mockReturnValue({ set: mockSet })
  })

  afterEach(() => {
    // Clean up after each test
    jest.clearAllMocks()
    process.env = originalEnv
  })

  it('should sign a JWT and set it as a cookie', async () => {
    const userId = '123'

    await setSessionCookie(userId)

    const [name, value, options] = mockSet.mock.calls[0]
    const decoded = jwt.verify(value, 'test-secret') as { id: number }

    // Validate cookie options
    expect(name).toBe('token')
    expect(decoded.id).toBe(userId)
    expect(options).toMatchObject({
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24,
    })
  })
})
