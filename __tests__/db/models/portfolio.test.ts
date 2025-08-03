import path from 'path'

import {
  getHolding,
  insertHolding,
  updateHoldingQuantityAndPrice,
  deleteHolding,
} from '@/db/models/portfolio'
import { insertUser } from '@/db/models/users'
import db from '@/lib/db'
import { createTestDB } from '@/lib/test-helpers/create-test-db'

// Ordered list of migration scripts to apply before tests
const migrationPaths = [
  path.join(__dirname, '../../../db/migrations/001_create_users_table.sql'),
  path.join(__dirname, '../../../db/migrations/002_create_accounts_table.sql'),
  path.join(__dirname, '../../../db/migrations/003_create_portfolio_table.sql'),
]

const deleteTestUser = (email: string, userId: number) => {
  // Look up user by email
  const user = db.prepare('SELECT id FROM users WHERE email = ?').get(email)
  if (!user) {
    return
  }

  const deleteTransactionsStmt = db.prepare(`
    DELETE FROM transactions
    WHERE user_id IN (SELECT id FROM accounts WHERE user_id = ?)
  `)

  const deleteAccountsStmt = db.prepare(`
    DELETE FROM accounts WHERE user_id = ?
  `)

  const deleteUserStmt = db.prepare(`
    DELETE FROM users WHERE id = ?
  `)

  const transaction = db.transaction((userId: number) => {
    deleteTransactionsStmt.run(userId)
    deleteAccountsStmt.run(userId)
    deleteUserStmt.run(userId)
  })

  transaction(userId)
}

describe('Portfolio Model', () => {
  const user = {
    id: 10,
    email: 'stock@example.com',
    password_hash: 'hash',
    first_name: 'John',
    last_name: 'Doe',
    image: '',
    created_at: new Date().toISOString(),
  }

  // Insert a user into the database before each test
  beforeEach(() => {
    createTestDB(migrationPaths)
    deleteTestUser(user.email, user.id)
    insertUser(user)
  })

  afterEach(() => {
    deleteTestUser(user.email, user.id)
  })

  it('inserts and fetches a holding', async () => {
    insertHolding(user.id, 'AAPL', 10, 150.0)

    const holding = await getHolding(user.id, 'AAPL')

    expect(holding).toEqual(
      expect.objectContaining({
        user_id: user.id,
        symbol: 'AAPL',
        quantity: 10,
        average_price: 150.0,
      }),
    )
  })

  it('updates holding quantity and average price', async () => {
    insertHolding(user.id, 'GOOG', 5, 1000.0)

    updateHoldingQuantityAndPrice(user.id, 'GOOG', 8, 1100.0)

    const updated = await getHolding(user.id, 'GOOG')

    expect(updated).toEqual(
      expect.objectContaining({
        quantity: 8,
        average_price: 1100.0,
      }),
    )
  })

  it('deletes a holding', async () => {
    // Insert the holding to be deleted
    insertHolding(user.id, 'MSFT', 20, 300.0)

    const beforeDelete = await getHolding(user.id, 'MSFT')
    expect(beforeDelete).not.toBeUndefined()

    // Delete the holding
    await deleteHolding(user.id, 'MSFT')

    // Assert that the holding no longer exists
    const afterDelete = await getHolding(user.id, 'MSFT')
    expect(afterDelete).toBeUndefined()
  })
})
