import { test, expect } from '@playwright/test'
import bcrypt from 'bcrypt'
import db from '@/lib/db'
import { User } from '@/types/user'
import { insertUser } from '@/db/models/users'

const TEST_EMAIL = 'testuser@example.com'
const TEST_PASSWORD = 'TestPass123'

test.describe('E2E: Stock search', () => {
  test.beforeEach(async ({ page }) => {
    // Seed user in DB
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

    // --- Mock the search API ---
    await page.route('**/api/stocks?**', async route => {
      const mockResults = [
        {
          symbol: 'AAPL',
          description: 'APPLE INC COMMON STOCK',
          type: 'EQUITY',
        },
      ]
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockResults),
      })
    })
  })

  test.afterEach(() => {
    db.prepare('DELETE FROM users WHERE email = ?').run(TEST_EMAIL)
  })

  test('logs in and searches for stock using mixed casing', async ({ page }) => {
    // Go to login page
    await page.goto('/')

    // Switch to Sign In tab if needed
    const loginTab = page.getByRole('button', { name: /Sign In/i })
    await loginTab.waitFor({ state: 'visible' })
    if (await loginTab.isVisible()) {
      await loginTab.click()
    }

    // Fill in login form
    await page.fill('#email', TEST_EMAIL)
    await page.fill('#password', TEST_PASSWORD)

    // Wait for login button to be enabled
    const loginButton = page.getByLabel('submit-signin')
    await expect(loginButton).toBeEnabled()
    await loginButton.click()

    // Expect redirect to dashboard
    await expect(page).toHaveURL('/dashboard')

    // Search with mixed casing
    const searchInput = page.getByPlaceholder('Search stocks...')
    await searchInput.fill('aApL')
    await searchInput.focus() // keep dropdown open

    // Wait for mocked dropdown result
    const option = page.getByRole('link', { name: /AAPL APPLE INC COMMON STOCK/i })
    await expect(option).toBeVisible({ timeout: 5000 })
  })
})
