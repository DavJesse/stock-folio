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

// Run migrations before all tests once
beforeAll(() => {
  createTestDB(migrationPaths)
})

// Clean up tables before each individual test
beforeEach(() => {
  db.prepare('DELETE FROM portfolio').run()
  db.prepare('DELETE FROM users').run()
})

describe('Portfolio Model', () => {
  const user = {
    id: 10,
    email: 'stock@example.com',
    password_hash: 'hash',
    created_at: new Date(),
  }

  // Insert a user into the database before each test
  beforeEach(() => {
    insertUser(user)
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
