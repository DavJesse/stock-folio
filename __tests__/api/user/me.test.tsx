import { GET, PUT } from '@/app/api/user/me/route'
import { NextRequest } from 'next/server'
import { getUserFromSessionCookie } from '@/lib/security/get-user-from-session-cookie'
import { getPasswordlessUserById, updateUserById } from '@/db/models/users'

// Mock external dependencies
jest.mock('@/lib/security/get-user-from-session-cookie')
jest.mock('@/db/models/users')

// Explicit mocks for named exports to ensure test control
jest.mock('@/lib/security/get-user-from-session-cookie', () => ({
  getUserFromSessionCookie: jest.fn(),
}))
jest.mock('@/db/models/users', () => ({
  getPasswordlessUserById: jest.fn(),
  updateUserById: jest.fn(),
}))

// Override NextResponse.json to control response behavior in tests
jest.mock('next/server', () => {
  const original = jest.requireActual('next/server')
  return {
    ...original,
    NextResponse: {
      ...original.NextResponse,
      json: jest.fn((data, init) => ({
        status: init?.status || 200,
        json: async () => data,
      })),
    },
  }
})

// Cast mocked functions for type safety and IntelliSense
const mockGetUserFromSessionCookie = getUserFromSessionCookie as jest.MockedFunction<typeof getUserFromSessionCookie>
const mockGetPasswordlessUserById = getPasswordlessUserById as jest.MockedFunction<typeof getPasswordlessUserById>
const mockUpdateUserById = updateUserById as jest.MockedFunction<typeof updateUserById>

describe('/api/user/me', () => {
  describe('GET', () => {
    it('returns 401 if user is not authenticated', async () => {
      mockGetUserFromSessionCookie.mockResolvedValue(undefined)

      const req = {} as NextRequest
      const res = await GET(req)

      expect(res.status).toBe(401)
    })

    it('returns 404 if user is not found', async () => {
      mockGetUserFromSessionCookie.mockResolvedValue({ userId: 1 })
      mockGetPasswordlessUserById.mockResolvedValue(undefined)

      const req = {} as NextRequest
      const res = await GET(req)

      expect(res.status).toBe(404)
    })

    it('returns user data if found and authenticated', async () => {
      mockGetUserFromSessionCookie.mockResolvedValue({ userId: 1 })
      mockGetPasswordlessUserById.mockResolvedValue({
        id: 1,
        email: 'test@example.com',
        first_name: 'John',
        last_name: 'Doe',
        created_at: '2023-01-01',
      })

      const req = {} as NextRequest
      const res = await GET(req)
      const json = await res.json()

      expect(res.status).toBe(200)
      expect(json.email).toBe('test@example.com')
    })
  })

  describe('PUT', () => {
    const validBody = {
      first_name: 'Jane',
      last_name: 'Doe',
      email: 'jane@example.com',
      image: '/image.png',
    }

    const mockJson = jest.fn()

    beforeEach(() => {
      // Setup default request body
      mockJson.mockResolvedValue(validBody)
    })

    it('returns 401 if user is not authenticated', async () => {
      mockGetUserFromSessionCookie.mockResolvedValue(undefined)

      const req = {
        json: mockJson,
      } as unknown as NextRequest

      const res = await PUT(req)

      expect(res.status).toBe(401)
    })

    it('returns 400 if required fields are missing', async () => {
      mockGetUserFromSessionCookie.mockResolvedValue({ userId: 1 })
      mockJson.mockResolvedValue({}) // empty body to simulate missing fields

      const req = {
        json: mockJson,
      } as unknown as NextRequest

      const res = await PUT(req)

      expect(res.status).toBe(400)
    })

    it('returns 500 if update fails', async () => {
      mockGetUserFromSessionCookie.mockResolvedValue({ userId: 1 })
      mockUpdateUserById.mockResolvedValue(false) // simulate DB failure

      const req = {
        json: mockJson,
      } as unknown as NextRequest

      const res = await PUT(req)

      expect(res.status).toBe(500)
    })

    it('returns 200 on successful update', async () => {
      mockGetUserFromSessionCookie.mockResolvedValue({ userId: 1 })
      mockUpdateUserById.mockResolvedValue(true)

      const req = {
        json: mockJson,
      } as unknown as NextRequest

      const res = await PUT(req)
      const json = await res.json()

      expect(res.status).toBe(200)
      expect(json.message).toBe('User updated successfully')
    })
  })
})
