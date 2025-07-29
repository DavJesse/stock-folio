import { GET as historyHandler } from '@/app/api/transactions/history/route'
import { getUserFromSessionCookie } from '@/lib/security/get-user-from-session-cookie'
import db from '@/lib/db'
import { createMocks } from 'node-mocks-http'
import { NextRequest } from 'next/server'

// Mocks
jest.mock('@/lib/security/get-user-from-session-cookie')
jest.mock('@/lib/db')

// Mock NextResponse.json to work with node-fetch
jest.mock('next/server', () => {
  const actual = jest.requireActual('next/server')
  return {
    ...actual,
    NextResponse: {
      ...actual.NextResponse,
      json: jest.fn((data: unknown, init?: ResponseInit) => {
        const mockResponse = {
          json: async () => data,
          status: init?.status || 200,
          headers: new Headers(init?.headers),
          ok: (init?.status || 200) >= 200 && (init?.status || 200) < 300,
        }
        return mockResponse
      }),
    },
  }
})

/**
 * Creates a mock NextRequest for GET with optional query params.
 */
function createMockNextRequest(url: string): NextRequest {
  const { req } = createMocks({
    method: 'GET',
  })

  return new NextRequest(new Request(url, { method: 'GET', headers: req.headers as HeadersInit }))
}

describe('GET /api/transactions/history', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns 401 if user is not authenticated', async () => {
    ;(getUserFromSessionCookie as jest.Mock).mockResolvedValue(null)

    const req = createMockNextRequest('http://localhost/api/transactions/history')
    const res = await historyHandler(req)

    expect(res.status).toBe(401)
    const json = await res.json()
    expect(json).toEqual({ error: 'Unauthorized' })
  })

  it('returns paginated transactions for authenticated user', async () => {
    ;(getUserFromSessionCookie as jest.Mock).mockResolvedValue({ userId: 123 })

    // Mock db.prepare().get() and .all()
    const mockPrepare = jest.fn().mockImplementation((sql: string) => {
      if (sql.includes('COUNT')) {
        return { 
          get: jest.fn(() => ({ total: 2 }))
        }
      } else {
        return {
          all: jest.fn(() => [
            { symbol: 'AAPL', type: 'buy', quantity: 10, price: 150.00, created_at: '2023-01-01T10:00:00Z' },
            { symbol: 'GOOGL', type: 'sell', quantity: 5, price: 2500.00, created_at: '2023-01-02T10:00:00Z' },
          ])
        }
      }
    })
    ;(db.prepare as jest.Mock).mockImplementation(mockPrepare)

    // Use correct query params that match the handler (limit and offset, not page)
    const req = createMockNextRequest('http://localhost/api/transactions/history?limit=2&offset=0')
    const res = await historyHandler(req)

    expect(res.status).toBe(200)
    const json = await res.json()

    // Match the actual response structure from the handler
    expect(json).toEqual({
      transactions: [
        { symbol: 'AAPL', type: 'buy', quantity: 10, price: 150.00, created_at: '2023-01-01T10:00:00Z' },
        { symbol: 'GOOGL', type: 'sell', quantity: 5, price: 2500.00, created_at: '2023-01-02T10:00:00Z' },
      ],
      total: 2,
    })
  })

  it('uses default pagination values when not provided', async () => {
    ;(getUserFromSessionCookie as jest.Mock).mockResolvedValue({ userId: 123 })

    const mockPrepare = jest.fn().mockImplementation((sql: string) => {
      if (sql.includes('COUNT')) {
        return { 
          get: jest.fn(() => ({ total: 5 }))
        }
      } else {
        return {
          all: jest.fn((userId: number, limit: number, offset: number) => {
            // Verify default values are used
            expect(limit).toBe(10) // default limit
            expect(offset).toBe(0) // default offset
            return []
          })
        }
      }
    })
    ;(db.prepare as jest.Mock).mockImplementation(mockPrepare)

    const req = createMockNextRequest('http://localhost/api/transactions/history')
    const res = await historyHandler(req)

    expect(res.status).toBe(200)
  })

  it('handles custom pagination parameters', async () => {
    ;(getUserFromSessionCookie as jest.Mock).mockResolvedValue({ userId: 123 })

    const mockPrepare = jest.fn().mockImplementation((sql: string) => {
      if (sql.includes('COUNT')) {
        return { 
          get: jest.fn(() => ({ total: 25 }))
        }
      } else {
        return {
          all: jest.fn((userId: number, limit: number, offset: number) => {
            // Verify custom values are used
            expect(limit).toBe(5)
            expect(offset).toBe(10)
            return []
          })
        }
      }
    })
    ;(db.prepare as jest.Mock).mockImplementation(mockPrepare)

    const req = createMockNextRequest('http://localhost/api/transactions/history?limit=5&offset=10')
    const res = await historyHandler(req)

    expect(res.status).toBe(200)
  })
})
