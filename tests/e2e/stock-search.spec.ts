import { test, expect } from '@playwright/test'
import bcrypt from 'bcrypt'
import db from '@/lib/db'
import { insertUser } from '@/db/models/users'
import { User } from '@/types/user'

const TEST_EMAIL = 'testuser@example.com'
const TEST_PASSWORD = 'TestPass123'

test.describe('E2E: Stock search', () => {
  let searchHit = false

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

    // Mock search API
    await page.route('**/api/stocks*', async route => {
      searchHit = true
      console.log('Intercepted search request:', route.request().url())
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            symbol: 'AAPL',
            name: 'APPLE INC COMMON STOCK',
            exchange: 'NASDAQ',
          },
        ]),
      })
    })
  })

  test.afterEach(() => {
    db.prepare('DELETE FROM users WHERE email = ?').run(TEST_EMAIL)
    if (!searchHit) console.warn('⚠ No search API request intercepted!')
    searchHit = false
  })

  test('logs in and searches for stock using mixed casing', async ({ page }) => {
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

    // Search
    const searchInput = page.getByPlaceholder('Search stocks...')
    await searchInput.fill('aApL')

    // Wait for mocked dropdown
    const option = page.getByRole('link', { name: /AAPL APPLE INC COMMON STOCK/i })
    await expect(option).toBeVisible({ timeout: 10000 })
  })
})
