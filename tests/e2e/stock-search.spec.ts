import { test, expect } from '@playwright/test'
import bcrypt from 'bcrypt'
import db from '@/lib/db'

const TEST_EMAIL = 'testuser@example.com'
const TEST_PASSWORD = 'TestPass123'

test.describe('E2E: Stock search', () => {
  // Before the test, seed the user in the database
  test.beforeEach(() => {
    const passwordHash = bcrypt.hashSync(TEST_PASSWORD, 10)

    db.prepare(`
      INSERT INTO users (email, password_hash, created_at)
      VALUES (?, ?, datetime('now', 'localtime'))
    `).run(TEST_EMAIL, passwordHash)
  })

  // After the test, clean up the user
  test.afterEach(() => {
    db.prepare('DELETE FROM users WHERE email = ?').run(TEST_EMAIL)
  })

  test('logs in and searches for stock using mixed casing', async ({ page }) => {
    // Go to login page
    await page.goto('/')

    // Wait for login tab to appear and switch to Log In tab if needed
    const loginTab = page.getByRole('button', { name: /Sign In/i })
    await loginTab.waitFor({ state: 'visible' })
    if (await loginTab.isVisible()) {
      await loginTab.click()
    }

    // Wait for email and password fields to be attached to the DOM
    await page.waitForSelector('#email')
    await page.waitForSelector('#password')

    // Fill in login form
    await page.fill('#email', TEST_EMAIL)
    await page.fill('#password', TEST_PASSWORD)

    // Wait for login button to be enabled
    const loginButton = page.getByLabel('submit-signin')
    await page.waitForSelector('[aria-label="submit-signin"]:not([disabled])')

    // Click login button
    await expect(loginButton).toBeEnabled()
    await loginButton.click()

    // Expect redirect to dashboard
    await expect(page).toHaveURL('/dashboard')

    // Fill in stock search with mixed casing
    const searchInput = page.getByPlaceholder('Search stocks...')
    await searchInput.fill('aApL')

    // Wait for dropdown result to load
    await page.waitForTimeout(600)

    // Check that correct stock appears
    await expect(
  page.getByRole('link', { name: /AAPL APPLE INC COMMON STOCK/i })
).toBeVisible()
  })
})
