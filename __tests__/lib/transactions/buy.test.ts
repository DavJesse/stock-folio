import { buyStock } from '@/lib/transactions/buy'
import { insertUser } from '@/db/models/users'
import * as accountModel from '@/db/models/accounts'
import * as portfolioModel from '@/db/models/portfolio'
import deleteTestUserByEmail from '@/lib/test-helpers/delete-test-user'
import deleteUserByUserId from '@/lib/test-helpers/delete-user-by-id'
import { User } from '@/types/user'

// Mock dependent modules to isolate the buyStock logic
jest.mock('@/db/models/accounts')
jest.mock('@/db/models/portfolio')

describe('buyStock', () => {
  const symbol = 'AAPL'
  const quantity = 10
  const price = 150
  const totalCost = quantity * price
  const now = new Date().toISOString()

  const user: User = {
    id: 123,
    email: 'test@example.com',
    password_hash: 'hashed_pw',
    first_name: 'John',
    last_name: 'Doe',
    image: '',
    created_at: now,
  }

  beforeEach(() => {
    // Reset mock call history and DB state before each test
    jest.clearAllMocks()
    deleteTestUserByEmail(user.email)
    deleteUserByUserId(user.id)
    insertUser(user)
  })

  afterEach(() => {
    // Clean up user after each test to avoid test bleed
    deleteTestUserByEmail(user.email)
    deleteUserByUserId(user.id)
  })

  it('should buy a new stock when user has enough cash', async () => {
    // Simulate user with sufficient cash and no existing holding
    ;(accountModel.getAccountByUserId as jest.Mock).mockResolvedValue({
      user_id: user.id,
      cash_balance: 5000,
    })
    ;(portfolioModel.getHolding as jest.Mock).mockResolvedValue(null)

    // Expect cash to be updated and a new holding to be created
    ;(accountModel.updateCashBalance as jest.Mock).mockResolvedValue(undefined)
    ;(portfolioModel.insertHolding as jest.Mock).mockResolvedValue({
      user_id: user.id,
      symbol,
      quantity,
      avg_price: price,
    })

    const result = await buyStock(user.id, symbol, quantity, price)

    // Verify updated account and portfolio values
    expect(result.cash_balance).toBe(5000 - totalCost)
    expect(result.portfolio.symbol).toBe(symbol)
    expect(result.portfolio.quantity).toBe(quantity)
    expect(result.portfolio.average_price).toBe(price)
    expect(portfolioModel.insertHolding).toHaveBeenCalled()
  })

  it('should update existing stock with new average price', async () => {
    // Simulate user with existing holding of same stock
    ;(accountModel.getAccountByUserId as jest.Mock).mockResolvedValue({
      user_id: user.id,
      cash_balance: 5000,
    })
    ;(portfolioModel.getHolding as jest.Mock).mockResolvedValue({
      user_id: user.id,
      symbol,
      quantity: 5,
      avg_price: 100,
    })

    // Expect portfolio update to recalculate avg_price across combined shares
    ;(accountModel.updateCashBalance as jest.Mock).mockResolvedValue(undefined)
    ;(portfolioModel.updateHoldingQuantityAndPrice as jest.Mock).mockResolvedValue({
      user_id: user.id,
      symbol,
      quantity: 15,
      avg_price: (5 * 100 + 10 * 150) / 15,
    })

    const result = await buyStock(user.id, symbol, quantity, price)

    // Verify combined holding and reduced cash
    expect(result.cash_balance).toBe(5000 - totalCost)
    expect(result.portfolio.quantity).toBe(15)
  })

  it('should throw an error if cash balance is insufficient', async () => {
    // Simulate account with insufficient balance
    ;(accountModel.getAccountByUserId as jest.Mock).mockResolvedValue({
      user_id: user.id,
      cash_balance: 100,
    })

    // Should reject due to funds check
    await expect(buyStock(user.id, symbol, quantity, price)).rejects.toThrow('Insufficient funds')
  })

  it('should throw error if quantity is non-positive', async () => {
    // Invalid quantity: 0 or negative
    await expect(buyStock(user.id, symbol, 0, price)).rejects.toThrow('Invalid purchase input')
    await expect(buyStock(user.id, symbol, -5, price)).rejects.toThrow('Invalid purchase input')
  })

  it('should throw error if price is non-positive', async () => {
    // Invalid price: 0 or negative
    await expect(buyStock(user.id, symbol, 1, 0)).rejects.toThrow('Invalid purchase input')
    await expect(buyStock(user.id, symbol, 1, -10)).rejects.toThrow('Invalid purchase input')
  })
})
