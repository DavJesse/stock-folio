import { GET, PUT } from '@/app/api/user/me/route'
import { NextRequest } from 'next/server'
import { getUserFromSessionCookie } from '@/lib/security/get-user-from-session-cookie'
import { getPasswordlessUserById, updateUserById } from '@/db/models/users'
import fs from 'fs'
import path from 'path'
import { randomUUID } from 'crypto'

// Mock external dependencies
jest.mock('@/lib/security/get-user-from-session-cookie')
jest.mock('@/db/models/users')
jest.mock('fs')
jest.mock('path')
jest.mock('crypto')

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

// Mock Busboy for multipart form testing
const mockBusboy = {
  on: jest.fn(),
  write: jest.fn(),
  end: jest.fn(),
}
jest.mock('busboy', () => {
  return jest.fn(() => mockBusboy)
})

// Cast mocked functions for type safety and IntelliSense
const mockGetUserFromSessionCookie = getUserFromSessionCookie as jest.MockedFunction<typeof getUserFromSessionCookie>
const mockGetPasswordlessUserById = getPasswordlessUserById as jest.MockedFunction<typeof getPasswordlessUserById>
const mockUpdateUserById = updateUserById as jest.MockedFunction<typeof updateUserById>
const mockFs = fs as jest.Mocked<typeof fs>
const mockPath = path as jest.Mocked<typeof path>
const mockRandomUUID = randomUUID as jest.MockedFunction<typeof randomUUID>

// Helper function to create mock NextRequest
const createMockRequest = (options: {
  json?: () => Promise<Record<string, unknown>>
  contentType?: string
  headers?: Record<string, string>
  body?: ReadableStream
} = {}): NextRequest => {
  const mockHeaders = new Map(Object.entries(options.headers || {}))
  
  // Set default content-type if not provided
  if (options.contentType && !mockHeaders.has('content-type')) {
    mockHeaders.set('content-type', options.contentType)
  }

  const mockReader = {
    read: jest.fn().mockResolvedValue({ done: true, value: undefined })
  }

  return {
    json: options.json || jest.fn(),
    headers: {
      get: jest.fn((name: string) => mockHeaders.get(name.toLowerCase()) || null)
    },
    body: options.body || {
      getReader: () => mockReader
    }
  } as unknown as NextRequest
}

// Helper to create mock readable stream with data
const createMockStreamWithData = (chunks: Uint8Array[]): ReadableStream => {
  let chunkIndex = 0
  const mockReader = {
    read: jest.fn().mockImplementation(() => {
      if (chunkIndex < chunks.length) {
        return Promise.resolve({ done: false, value: chunks[chunkIndex++] })
      }
      return Promise.resolve({ done: true, value: undefined })
    })
  }

  return {
    getReader: () => mockReader
  } as unknown as ReadableStream
}

describe('/api/user/me', () => {
  describe('GET', () => {
    it('returns 401 if user is not authenticated', async () => {
      mockGetUserFromSessionCookie.mockResolvedValue(undefined)

      const req = createMockRequest()
      const res = await GET(req)

      expect(res.status).toBe(401)
    })

    it('returns 404 if user is not found', async () => {
      mockGetUserFromSessionCookie.mockResolvedValue({ userId: 1 })
      mockGetPasswordlessUserById.mockResolvedValue(undefined)

      const req = createMockRequest()
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

      const req = createMockRequest()
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

    beforeEach(() => {
      // Reset all mocks before each test
      jest.clearAllMocks()
      
      // Setup default successful responses
      mockGetUserFromSessionCookie.mockResolvedValue({ userId: 1 })
      mockGetPasswordlessUserById.mockResolvedValue({
        id: 1,
        email: 'existing@example.com',
        first_name: 'Existing',
        last_name: 'User',
        image: '/old-image.png',
        created_at: '2023-01-01',
      })

      // Setup default fs mocks
      mockFs.existsSync.mockReturnValue(true)
      mockFs.mkdirSync.mockReturnValue(undefined)
      mockFs.unlinkSync.mockReturnValue(undefined)
      mockPath.join.mockReturnValue('/mocked/path')
      mockRandomUUID.mockReturnValue('12345678-1234-1234-1234-123456789012')
    })

    describe('JSON requests', () => {
      it('returns 401 if user is not authenticated', async () => {
        mockGetUserFromSessionCookie.mockResolvedValue(undefined)

        const req = createMockRequest({
          json: () => Promise.resolve(validBody),
          contentType: 'application/json'
        })

        const res = await PUT(req)

        expect(res.status).toBe(401)
      })

      it('returns 404 if user is not found', async () => {
        mockGetUserFromSessionCookie.mockResolvedValue({ userId: 1 })
        mockGetPasswordlessUserById.mockResolvedValue(undefined)

        const req = createMockRequest({
          json: () => Promise.resolve(validBody),
          contentType: 'application/json'
        })

        const res = await PUT(req)

        expect(res.status).toBe(404)
      })

      it('returns 400 if first_name is missing', async () => {
        const bodyWithoutFirstName = {
          last_name: 'Doe',
          email: 'jane@example.com',
        }

        const req = createMockRequest({
          json: () => Promise.resolve(bodyWithoutFirstName),
          contentType: 'application/json'
        })

        const res = await PUT(req)

        expect(res.status).toBe(400)
        const json = await res.json()
        expect(json.error).toBe('Missing required fields')
      })

      it('returns 400 if last_name is missing', async () => {
        const bodyWithoutLastName = {
          first_name: 'Jane',
          email: 'jane@example.com',
        }

        const req = createMockRequest({
          json: () => Promise.resolve(bodyWithoutLastName),
          contentType: 'application/json'
        })

        const res = await PUT(req)

        expect(res.status).toBe(400)
      })

      it('returns 400 if email is missing', async () => {
        const bodyWithoutEmail = {
          first_name: 'Jane',
          last_name: 'Doe',
        }

        const req = createMockRequest({
          json: () => Promise.resolve(bodyWithoutEmail),
          contentType: 'application/json'
        })

        const res = await PUT(req)

        expect(res.status).toBe(400)
      })

      it('returns 400 if all required fields are empty strings', async () => {
        const bodyWithEmptyFields = {
          first_name: '',
          last_name: '',
          email: '',
        }

        const req = createMockRequest({
          json: () => Promise.resolve(bodyWithEmptyFields),
          contentType: 'application/json'
        })

        const res = await PUT(req)

        expect(res.status).toBe(400)
      })

      it('returns 500 if update fails', async () => {
        mockUpdateUserById.mockResolvedValue(false) // simulate DB failure

        const req = createMockRequest({
          json: () => Promise.resolve(validBody),
          contentType: 'application/json'
        })

        const res = await PUT(req)

        expect(res.status).toBe(500)
      })

      it('returns 200 on successful update', async () => {
        mockUpdateUserById.mockResolvedValue(true)

        const req = createMockRequest({
          json: () => Promise.resolve(validBody),
          contentType: 'application/json'
        })

        const res = await PUT(req)
        const json = await res.json()

        expect(res.status).toBe(200)
        expect(json.message).toBe('User updated successfully')
      })

      it('preserves existing image when no new image is provided in JSON request', async () => {
        mockUpdateUserById.mockResolvedValue(true)

        const bodyWithoutImage = {
          first_name: 'Jane',
          last_name: 'Doe',
          email: 'jane@example.com',
          // no image field
        }

        const req = createMockRequest({
          json: () => Promise.resolve(bodyWithoutImage),
          contentType: 'application/json'
        })

        const res = await PUT(req)

        expect(mockUpdateUserById).toHaveBeenCalledWith(1, {
          first_name: 'Jane',
          last_name: 'Doe',
          email: 'jane@example.com',
          image: '/old-image.png', // should preserve existing image
        })
        expect(res.status).toBe(200)
      })

      it('uses new image when provided in JSON request', async () => {
        mockUpdateUserById.mockResolvedValue(true)

        const req = createMockRequest({
          json: () => Promise.resolve(validBody),
          contentType: 'application/json'
        })

        const res = await PUT(req)

        expect(mockUpdateUserById).toHaveBeenCalledWith(1, {
          first_name: 'Jane',
          last_name: 'Doe',
          email: 'jane@example.com',
          image: '/image.png', // should use new image
        })
        expect(res.status).toBe(200)
      })

      it('handles JSON parsing errors gracefully', async () => {
        const req = createMockRequest({
          json: () => Promise.reject(new Error('Invalid JSON')),
          contentType: 'application/json'
        })

        // This test depends on how your actual handler deals with JSON parsing errors
        // You might need to add try-catch around req.json() in your handler
        await expect(PUT(req)).rejects.toThrow('Invalid JSON')
      })
    })

    describe('Multipart form data requests', () => {
      it('returns 400 for invalid file types', async () => {
        const mockStream = createMockStreamWithData([new Uint8Array([1, 2, 3])])
        
        const req = createMockRequest({
          contentType: 'multipart/form-data; boundary=----formdata-boundary',
          body: mockStream
        })

        // Setup busboy to simulate file upload with invalid type
        mockBusboy.on.mockImplementation((event, callback) => {
          if (event === 'field') {
            // Simulate form fields
            setTimeout(() => {
              callback('first_name', 'Jane')
              callback('last_name', 'Doe')
              callback('email', 'jane@example.com')
            }, 0)
          } else if (event === 'file') {
            // Simulate file upload with invalid mime type
            setTimeout(() => {
              callback('image', {}, { filename: 'test.gif', mimeType: 'image/gif' })
            }, 0)
          } else if (event === 'finish') {
            // Don't call finish to simulate the error case
          }
        })

        const res = await PUT(req)

        expect(res.status).toBe(400)
        const json = await res.json()
        expect(json.error).toBe('Only JPEG and PNG images are allowed')
      })

      it('returns 400 for files exceeding size limit', async () => {
        const mockStream = createMockStreamWithData([new Uint8Array([1, 2, 3])])
        
        const req = createMockRequest({
          contentType: 'multipart/form-data; boundary=----formdata-boundary',
          body: mockStream
        })

        const mockFile = {
          on: jest.fn(),
          pipe: jest.fn(),
          destroy: jest.fn()
        }

        const mockWriteStream = {
          on: jest.fn(),
          destroy: jest.fn()
        }

        mockFs.createWriteStream.mockReturnValue(mockWriteStream as unknown as fs.WriteStream)

        // Setup busboy to simulate file upload
        mockBusboy.on.mockImplementation((event, callback) => {
          if (event === 'field') {
            setTimeout(() => {
              callback('first_name', 'Jane')
              callback('last_name', 'Doe')
              callback('email', 'jane@example.com')
            }, 0)
          } else if (event === 'file') {
            setTimeout(() => {
              callback('image', mockFile, { filename: 'test.jpg', mimeType: 'image/jpeg' })
              
              // Simulate file data event with large size
              const dataCallback = mockFile.on.mock.calls.find(call => call[0] === 'data')?.[1]
              if (dataCallback) {
                // Simulate chunks that exceed 20MB
                const largeChunk = new Uint8Array(21 * 1024 * 1024) // 21MB
                dataCallback(largeChunk)
              }
            }, 0)
          }
        })

        const res = await PUT(req)

        expect(res.status).toBe(400)
        const json = await res.json()
        expect(json.error).toBe('File size must be less than 20MB')
      })

      it('returns 400 if required fields are missing in multipart request', async () => {
        const mockStream = createMockStreamWithData([new Uint8Array([1, 2, 3])])
        
        const req = createMockRequest({
          contentType: 'multipart/form-data; boundary=----formdata-boundary',
          body: mockStream
        })

        // Setup busboy to simulate missing required fields
        mockBusboy.on.mockImplementation((event, callback) => {
          if (event === 'field') {
            // Only provide some fields, missing required ones
            setTimeout(() => {
              callback('first_name', 'Jane')
              // missing last_name and email
            }, 0)
          } else if (event === 'finish') {
            setTimeout(() => callback(), 10)
          }
        })

        const res = await PUT(req)

        expect(res.status).toBe(400)
        const json = await res.json()
        expect(json.error).toBe('Missing required fields')
      })

      it('successfully processes multipart request with valid file', async () => {
        const mockStream = createMockStreamWithData([new Uint8Array([1, 2, 3])])
        
        const req = createMockRequest({
          contentType: 'multipart/form-data; boundary=----formdata-boundary',
          body: mockStream
        })

        const mockFile = {
          on: jest.fn(),
          pipe: jest.fn(),
          destroy: jest.fn()
        }

        const mockWriteStream = {
          on: jest.fn(),
          destroy: jest.fn()
        }

        mockFs.createWriteStream.mockReturnValue(mockWriteStream as unknown as fs.WriteStream)
        mockUpdateUserById.mockResolvedValue(true)

        // Setup busboy to simulate successful file upload
        mockBusboy.on.mockImplementation((event, callback) => {
          if (event === 'field') {
            setTimeout(() => {
              callback('first_name', 'Jane')
              callback('last_name', 'Doe')  
              callback('email', 'jane@example.com')
            }, 0)
          } else if (event === 'file') {
            setTimeout(() => {
              callback('image', mockFile, { filename: 'test.jpg', mimeType: 'image/jpeg' })
              
              // Simulate successful file processing
              const dataCallback = mockFile.on.mock.calls.find(call => call[0] === 'data')?.[1]
              if (dataCallback) {
                dataCallback(new Uint8Array([1, 2, 3])) // Small valid chunk
              }

              // Simulate successful write
              const finishCallback = mockWriteStream.on.mock.calls.find(call => call[0] === 'finish')?.[1]
              if (finishCallback) {
                setTimeout(() => finishCallback(), 0)
              }
            }, 0)
          } else if (event === 'finish') {
            setTimeout(() => callback(), 20)
          }
        })

        const res = await PUT(req)

        expect(res.status).toBe(200)
        const json = await res.json()
        expect(json.message).toBe('User updated successfully')
      })

      it('cleans up old image file when new one is uploaded', async () => {
        const mockStream = createMockStreamWithData([new Uint8Array([1, 2, 3])])
        
        // User with existing image in upload directory
        mockGetPasswordlessUserById.mockResolvedValue({
          id: 1,
          email: 'existing@example.com',
          first_name: 'Existing',
          last_name: 'User',
          image: '/profile-image-uploads/old-image.jpg',
          created_at: '2023-01-01',
        })

        const req = createMockRequest({
          contentType: 'multipart/form-data; boundary=----formdata-boundary',
          body: mockStream
        })

        const mockFile = {
          on: jest.fn(),
          pipe: jest.fn(),
          destroy: jest.fn()
        }

        const mockWriteStream = {
          on: jest.fn(),
          destroy: jest.fn()
        }

        mockFs.createWriteStream.mockReturnValue(mockWriteStream as unknown as fs.WriteStream)
        mockUpdateUserById.mockResolvedValue(true)

        // Setup busboy for successful upload
        mockBusboy.on.mockImplementation((event, callback) => {
          if (event === 'field') {
            setTimeout(() => {
              callback('first_name', 'Jane')
              callback('last_name', 'Doe')
              callback('email', 'jane@example.com')
            }, 0)
          } else if (event === 'file') {
            setTimeout(() => {
              callback('image', mockFile, { filename: 'new-test.jpg', mimeType: 'image/jpeg' })
              
              const dataCallback = mockFile.on.mock.calls.find(call => call[0] === 'data')?.[1]
              if (dataCallback) {
                dataCallback(new Uint8Array([1, 2, 3]))
              }

              // Trigger finish event to simulate old file cleanup
              const finishCallback = mockWriteStream.on.mock.calls.find(call => call[0] === 'finish')?.[1]
              if (finishCallback) {
                setTimeout(() => finishCallback(), 0)
              }
            }, 0)
          } else if (event === 'finish') {
            setTimeout(() => callback(), 20)
          }
        })

        const res = await PUT(req)

        expect(mockFs.unlinkSync).toHaveBeenCalled() // Old image should be deleted
        expect(res.status).toBe(200)
      })
    })

    describe('Content-Type handling', () => {
      it('returns 415 for unsupported content type', async () => {
        const req = createMockRequest({
          json: () => Promise.resolve(validBody),
          contentType: 'text/plain' // unsupported content type
        })

        const res = await PUT(req)

        expect(res.status).toBe(415)
        const json = await res.json()
        expect(json.error).toBe('Unsupported content type')
      })

      it('handles missing content-type header', async () => {
        const req = createMockRequest({
          json: () => Promise.resolve(validBody),
          // No content type specified
        })

        const res = await PUT(req)

        expect(res.status).toBe(415)
      })

      it('handles content-type with charset for JSON', async () => {
        mockUpdateUserById.mockResolvedValue(true)

        const req = createMockRequest({
          json: () => Promise.resolve(validBody),
          contentType: 'application/json; charset=utf-8'
        })

        const res = await PUT(req)

        expect(res.status).toBe(200)
      })

      it('handles content-type with boundary for multipart', async () => {
        const mockStream = createMockStreamWithData([new Uint8Array([1, 2, 3])])
        
        const req = createMockRequest({
          contentType: 'multipart/form-data; boundary=----formdata-boundary',
          body: mockStream
        })

        // Setup busboy for successful processing without file
        mockBusboy.on.mockImplementation((event, callback) => {
          if (event === 'field') {
            setTimeout(() => {
              callback('first_name', 'Jane')
              callback('last_name', 'Doe')
              callback('email', 'jane@example.com')
            }, 0)
          } else if (event === 'finish') {
            setTimeout(() => callback(), 10)
          }
        })

        mockUpdateUserById.mockResolvedValue(true)

        const res = await PUT(req)

        expect(res.status).toBe(200)
      })
    })

    describe('Edge cases and error scenarios', () => {
      it('handles database connection errors', async () => {
        mockGetPasswordlessUserById.mockRejectedValue(new Error('Database connection failed'))

        const req = createMockRequest({
          json: () => Promise.resolve(validBody),
          contentType: 'application/json'
        })

        await expect(PUT(req)).rejects.toThrow('Database connection failed')
      })

      it('handles user authentication service errors', async () => {
        mockGetUserFromSessionCookie.mockRejectedValue(new Error('Auth service unavailable'))

        const req = createMockRequest({
          json: () => Promise.resolve(validBody),
          contentType: 'application/json'
        })

        await expect(PUT(req)).rejects.toThrow('Auth service unavailable')
      })

      it('preserves existing image when user has no previous image', async () => {
        mockGetPasswordlessUserById.mockResolvedValue({
          id: 1,
          email: 'existing@example.com',
          first_name: 'Existing',
          last_name: 'User',
          image: '', // No existing image
          created_at: '2023-01-01',
        })
        mockUpdateUserById.mockResolvedValue(true)

        const bodyWithoutImage = {
          first_name: 'Jane',
          last_name: 'Doe',
          email: 'jane@example.com',
        }

        const req = createMockRequest({
          json: () => Promise.resolve(bodyWithoutImage),
          contentType: 'application/json'
        })

        const res = await PUT(req)

        expect(mockUpdateUserById).toHaveBeenCalledWith(1, {
          first_name: 'Jane',
          last_name: 'Doe',
          email: 'jane@example.com',
          image: '',
        })
        expect(res.status).toBe(200)
      })
    })
  })
})
