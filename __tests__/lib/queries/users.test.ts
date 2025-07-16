// Import the function under test
import { findUserByEmail } from '@/lib/queries/users'

// Import the database instance (mocked below)
import db from '@/lib/db'

// Import the User type for consistent structure in the test user object
import { User } from '@/types/user'

// Mock the database module to isolate and control db.prepare behavior
jest.mock('@/lib/db', () => {
  const prepareMock = jest.fn()
  return {
    prepare: prepareMock,
  }
})

describe('findUserByEmail', () => {
  // Define a sample user object to be returned by mock queries
  const mockUser: User = {
    id: 1,
    email: 'test@example.com',
    password_hash: 'hashed',
    created_at: '2024-01-01T00:00:00.000Z',
  }

  beforeEach(() => {
    // Reset all mock state before each test to prevent cross-test pollution
    jest.clearAllMocks()
  })

  it('returns a user if found', async () => {
    const mockGet = jest.fn().mockReturnValue(mockUser)

    // Mock db.prepare().get() to return the mock user
    ;(db.prepare as jest.Mock).mockReturnValue({ get: mockGet })

    const result = await findUserByEmail(mockUser.email)

    expect(result).toEqual(mockUser)
    expect(db.prepare).toHaveBeenCalledWith('SELECT * FROM users WHERE email = ?')
    expect(mockGet).toHaveBeenCalledWith(mockUser.email)
  })

  it('returns null if no user is found', async () => {
    const mockGet = jest.fn().mockReturnValue(undefined)

    // Simulate query that returns no result
    ;(db.prepare as jest.Mock).mockReturnValue({ get: mockGet })

    const result = await findUserByEmail('unknown@example.com')
    expect(result).toBeNull()
  })

  it('returns null on database error', async () => {
    // Simulate db.prepare throwing an error
    ;(db.prepare as jest.Mock).mockImplementation(() => {
      throw new Error('SQL failed')
    })

    const result = await findUserByEmail('test@example.com')
    expect(result).toBeNull()
  })
})
