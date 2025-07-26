import { sellStock } from '@/lib/transactions/sell'
import { insertUser } from '@/db/models/users'
import * as accountModel from '@/db/models/accounts'
import * as portfolioModel from '@/db/models/portfolio'
import deleteTestUserByEmail from '@/lib/test-helpers/delete-test-user'

jest.mock('@/db/models/accounts')
jest.mock('@/db/models/portfolio')

// Deletes all data related to a test user, including transactions, accounts, and the user record


describe('sellStock', () => {
  const symbol = 'AAPL'
  const quantity = 5
  const price = 200
  const totalValue = quantity * price
  const now = new Date()

  const user = {
    id: 123,
    email: 'test@example.com',
    password_hash: 'hashed_pw',
    created_at: now,
  }

  // Setup: Insert user into DB before each test
  beforeEach(() => {
    jest.clearAllMocks()
    deleteTestUserByEmail(user.email)
    insertUser(user)
  })

  // Teardown: Remove user from DB after each test
  afterEach(() => {
    deleteTestUserByEmail(user.email)
  })

  it('updates cash and portfolio when stock is sold', async () => {
    // Mock account and portfolio state
    ;(accountModel.getAccountByUserId as jest.Mock).mockResolvedValue({
      user_id: user.id,
      cash_balance: 1000,
    })
    ;(portfolioModel.getHolding as jest.Mock).mockResolvedValue({
      user_id: user.id,
      symbol,
      quantity: 10,
      avg_price: 150,
    })
    ;(accountModel.updateCashBalance as jest.Mock).mockResolvedValue(undefined)
    ;(portfolioModel.updateHoldingQuantityAndPrice as jest.Mock).mockResolvedValue({
      user_id: user.id,
      symbol,
      quantity: 5,
      avg_price: 150,
    })

    const result = await sellStock(user.id, symbol, quantity, price)

    expect(result.cash_balance).toBe(1000 + totalValue)
    expect(result.portfolio!.quantity).toBe(5)
  })

  it('removes holding if quantity reaches zero', async () => {
    ;(accountModel.getAccountByUserId as jest.Mock).mockResolvedValue({
      user_id: user.id,
      cash_balance: 500,
    })
    ;(portfolioModel.getHolding as jest.Mock).mockResolvedValue({
      user_id: user.id,
      symbol,
      quantity: 5,
      avg_price: 100,
    })
    ;(accountModel.updateCashBalance as jest.Mock).mockResolvedValue(undefined)
    ;(portfolioModel.deleteHolding as jest.Mock).mockResolvedValue(undefined)

    const result = await sellStock(user.id, symbol, quantity, price)

    expect(result.cash_balance).toBe(500 + totalValue)
    expect(portfolioModel.deleteHolding).toHaveBeenCalledWith(user.id, symbol)
  })

  it('throws if stock not found in portfolio', async () => {
    ;(portfolioModel.getHolding as jest.Mock).mockResolvedValue(null)

    await expect(
      sellStock(user.id, symbol, quantity, price)
    ).rejects.toThrow('Stock not found in portfolio')
  })

  it('throws if selling more than owned', async () => {
    ;(portfolioModel.getHolding as jest.Mock).mockResolvedValue({
      user_id: user.id,
      symbol,
      quantity: 3,
      avg_price: 100,
    })

    await expect(
      sellStock(user.id, symbol, quantity, price)
    ).rejects.toThrow('Not enough shares to sell')
  })

  it('rejects non-positive quantity', async () => {
    await expect(sellStock(user.id, symbol, 0, price)).rejects.toThrow('Invalid sell input')
    await expect(sellStock(user.id, symbol, -1, price)).rejects.toThrow('Invalid sell input')
  })

  it('rejects non-positive price', async () => {
    await expect(sellStock(user.id, symbol, quantity, 0)).rejects.toThrow('Invalid sell input')
    await expect(sellStock(user.id, symbol, quantity, -50)).rejects.toThrow('Invalid sell input')
  })
})
