import db from '@/lib/db'
import { getAccountByUserId, updateCashBalance } from '@/db/models/accounts'

describe('account model', () => {
  const userId = 9999

  beforeEach(() => {
    // Ensure test isolation by removing any existing user
    db.prepare('DELETE FROM users WHERE id = ?').run(userId)

    // Insert a test user
    db.prepare(`
      INSERT INTO users (id, email, password_hash, created_at)
      VALUES (?, ?, ?, CURRENT_TIMESTAMP)
    `).run(userId, 'test@example.com', 'hashed_pw')

    // Create an associated account for the user with an initial balance
    db.prepare(`
      INSERT INTO accounts (id, user_id, cash_balance, created_at)
      VALUES (?, ?, ?, CURRENT_TIMESTAMP)
    `).run(userId, userId, 5000)
  })

  afterEach(() => {
    // Remove test account and user records after each test
    db.prepare('DELETE FROM accounts WHERE user_id = ?').run(userId)
    db.prepare('DELETE FROM users WHERE id = ?').run(userId)
  })

  it('getAccountByUserId returns the correct account', async () => {
    // Should retrieve the correct account for the given user ID
    const account = await getAccountByUserId(userId)
    expect(account).toBeDefined()
    expect(account?.cash_balance).toBe(5000)
  })

  it('updateCashBalance updates the cash balance', async () => {
    // Update the balance, then check if the update was applied
    await updateCashBalance(userId, 7000)

    const updatedAccount = await getAccountByUserId(userId)
    expect(updatedAccount?.cash_balance).toBe(7000)
  })
})
