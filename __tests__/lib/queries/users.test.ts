import { findUserByEmail } from '@/lib/queries/users'
import db from '@/lib/db'
import { User } from '@/types/user'

jest.mock('@/lib/db', () => {
  const prepareMock = jest.fn()
  return {
    prepare: prepareMock,
  }
})

describe('findUserByEmail', () => {
  const mockUser: User = {
    id: 1,
    email: 'test@example.com',
    password_hash: 'hashed',
    created_at: '2024-01-01T00:00:00.000Z',
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns a user if found', async () => {
    const mockGet = jest.fn().mockReturnValue(mockUser)
    ;(db.prepare as jest.Mock).mockReturnValue({ get: mockGet })

    const result = await findUserByEmail(mockUser.email)
    expect(result).toEqual(mockUser)
    expect(db.prepare).toHaveBeenCalledWith('SELECT * FROM users WHERE email = ?')
    expect(mockGet).toHaveBeenCalledWith(mockUser.email)
  })

  it('returns null if no user is found', async () => {
    const mockGet = jest.fn().mockReturnValue(undefined)
    ;(db.prepare as jest.Mock).mockReturnValue({ get: mockGet })

    const result = await findUserByEmail('unknown@example.com')
    expect(result).toBeNull()
  })

  it('returns null on database error', async () => {
    ;(db.prepare as jest.Mock).mockImplementation(() => {
      throw new Error('SQL failed')
    })

    const result = await findUserByEmail('test@example.com')
    expect(result).toBeNull()
  })
})
