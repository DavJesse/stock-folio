// External dependencies
import bcrypt from 'bcrypt'

// Internal application modules
import { handleLogin } from '@/lib/handlers/login'
import { findUserByEmail } from '@/lib/queries/users/users'
import { User } from '@/types/user' // Import User type for strong typing

// Mock the bcrypt and database methods for isolated unit testing
jest.mock('bcrypt')
jest.mock('@/lib/queries/users/users')

describe('handleLogin', () => {
  // Define a mock user matching the User type
  const mockUser: User = {
    id: 123,
    email: 'user@example.com',
    password_hash: 'hashedPassword',
    created_at: new Date().toISOString(),
  }

  beforeEach(() => {
    // Ensure mocks are reset before each test
    jest.clearAllMocks()
  })

  it('returns 400 if email is missing', async () => {
    const res = await handleLogin('', 'password123')
    expect(res.status).toBe(400)
    expect(res.message).toMatch(/required/i)
  })

  it('returns 400 if password is missing', async () => {
    const res = await handleLogin('user@example.com', '')
    expect(res.status).toBe(400)
    expect(res.message).toMatch(/required/i)
  })

  it('returns 400 for invalid email format', async () => {
    const res = await handleLogin('invalid-email', 'password123')
    expect(res.status).toBe(400)
    expect(res.message).toMatch(/valid email/i)
  })

  it('returns 401 if user is not found', async () => {
    ;(findUserByEmail as jest.Mock).mockResolvedValue(null)

    const res = await handleLogin('notfound@example.com', 'password123')
    expect(res.status).toBe(401)
    expect(res.message).toMatch(/invalid credentials/i)
  })

  it('returns 401 if password is incorrect', async () => {
    ;(findUserByEmail as jest.Mock).mockResolvedValue(mockUser)
    ;(bcrypt.compare as jest.Mock).mockResolvedValue(false)

    const res = await handleLogin(mockUser.email, 'wrongpass')
    expect(res.status).toBe(401)
    expect(res.message).toMatch(/invalid credentials/i)
  })

  it('returns 200 and a token on valid credentials', async () => {
    ;(findUserByEmail as jest.Mock).mockResolvedValue(mockUser)
    ;(bcrypt.compare as jest.Mock).mockResolvedValue(true)

    const res = await handleLogin(mockUser.email, 'password123')
    expect(res.status).toBe(200)
    expect(res.token).toBeDefined()
    expect(res.message).toMatch(/success/i)
  })
})
