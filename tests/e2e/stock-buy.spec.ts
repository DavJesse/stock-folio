import { test, expect } from '@playwright/test'
import bcrypt from 'bcrypt'
import db from '@/lib/db'
import { insertUser } from '@/db/models/users'
import { User } from '@/types/user'

const TEST_EMAIL = 'testuser@example.com'
const TEST_PASSWORD = 'TestPass123'

test.describe('E2E: Stock buy', () => {
  let searchHit = false
  let buyHit = false

  test.beforeEach(async ({ page }) => {
    // Seed user
    const passwordHash = bcrypt.hashSync(TEST_PASSWORD, 10)
    const user: User = {
      id: 123,
      email: TEST_EMAIL,
      password_hash: passwordHash,
      first_name: 'John',
      last_name: 'Doe',
      image: '',
      created_at: new Date().toISOString(),
    }
    insertUser(user)

    // Mock stock search
    await page.route('**/api/stocks*', async route => {
      searchHit = true
      console.log('Intercepted search request:', route.request().url())
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            symbol: 'AAPL',
            name: 'APPLE INC Common Stock',
            exchange: 'NASDAQ',
          },
        ]),
      })
    })

    // Mock buy request
    await page.route('**/api/transactions/buy', async route => {
      buyHit = true
      console.log('Intercepted buy request:', route.request().url())
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          cash_balance: 9500,
          portfolio: {
            symbol: 'AAPL',
            quantity: 5,
            average_price: 100,
          },
        }),
      })
    })
  })

  test.afterEach(() => {
    db.prepare('DELETE FROM users WHERE email = ?').run(TEST_EMAIL)
    if (!searchHit) console.warn('⚠ No search API request intercepted!')
    if (!buyHit) console.warn('⚠ No buy API request intercepted!')
    searchHit = false
    buyHit = false
  })

  test('logs in, searches for stock, opens modal, and buys shares', async ({ page }) => {
    await page.goto('/')

    // Login
    const loginTab = page.getByRole('button', { name: /Sign In/i })
    await loginTab.waitFor({ state: 'visible' })
    await loginTab.click()
    await page.fill('#email', TEST_EMAIL)
    await page.fill('#password', TEST_PASSWORD)
    await expect(page.getByLabel('submit-signin')).toBeEnabled()
    await page.getByLabel('submit-signin').click()
    await expect(page).toHaveURL('/dashboard')

    // Search stock
    const searchInput = page.getByPlaceholder('Search stocks...')
    await searchInput.fill('AAPL')

    // Wait for mocked dropdown
    const listbox = page.getByRole('listbox')
    await expect(listbox).toBeVisible({ timeout: 10000 })

    // Select stock
    const option = page.getByRole('option', { name: /AAPL APPLE INC Common Stock/i })
    await expect(option).toBeVisible()
    await option.click()

    // Buy modal flow
    await page.fill('#quantity', '5')
    await page.getByRole('button', { name: /Buy/i }).click()

    // Expect success toast
    await expect(page.getByText(/purchase successful/i)).toBeVisible()
  })
})
