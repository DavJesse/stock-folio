import { test, expect } from '@playwright/test'
import bcrypt from 'bcrypt'
import db from '@/lib/db'
import { User } from '@/types/user'
import { insertUser } from '@/db/models/users'

const TEST_EMAIL = 'testuser@example.com'
const TEST_PASSWORD = 'TestPass123'

test.describe('E2E: Stock search', () => {
  test.beforeEach(async ({ page }) => {
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

    // Mock search API with better timing
    await page.route('**/api/stocks/**', async route => {
      console.log('Intercepted search request:', route.request().url())
      // Add small delay to simulate real API
      await new Promise(resolve => setTimeout(resolve, 100))
      const mockResults = [
        { symbol: 'AAPL', description: 'APPLE INC COMMON STOCK', type: 'EQUITY' }
      ]
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockResults)
      })
    })
  })

  test.afterEach(() => {
    db.prepare('DELETE FROM users WHERE email = ?').run(TEST_EMAIL)
  })

  test('logs in and searches for stock using mixed casing', async ({ page }) => {
    // Go to login page
    await page.goto('/')

    const loginTab = page.getByRole('button', { name: /Sign In/i })
    await loginTab.waitFor({ state: 'visible', timeout: 10000 })
    await loginTab.click()

    // Wait for form elements with explicit selectors
    await page.waitForSelector('#email', { timeout: 10000 })
    await page.waitForSelector('#password', { timeout: 10000 })

    await page.fill('#email', TEST_EMAIL)
    await page.fill('#password', TEST_PASSWORD)

    // Ensure login button is ready
    const loginButton = page.getByLabel('submit-signin')
    await loginButton.waitFor({ state: 'visible' })
    await expect(loginButton).toBeEnabled({ timeout: 10000 })
    await loginButton.click()

    // Wait for redirect with longer timeout
    await expect(page).toHaveURL('/dashboard', { timeout: 15000 })
    
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle')

    // Search with better timing
    const searchInput = page.getByPlaceholder('Search stocks...')
    await searchInput.waitFor({ state: 'visible' })
    await searchInput.click() // Ensure focus
    await searchInput.fill('aApL')

    // Wait for debounce and API call
    await page.waitForTimeout(500)

    // Try multiple selectors for the search result
    let option
    try {
      // First try the role-based selector
      option = page.getByRole('link', { name: /AAPL.*APPLE INC COMMON STOCK/i })
      await expect(option).toBeVisible({ timeout: 15000 })
    } catch (e) {
      console.log('Link not found by role, trying other selectors:', e)
      try {
        // Try option role instead of link
        option = page.getByRole('option', { name: /AAPL.*APPLE INC/i })
        await expect(option).toBeVisible({ timeout: 15000 })
      } catch (e2) {
        console.log('Option not found by role, trying text selector:', e2)
        // Fallback to text-based selector
        option = page.locator('text=/AAPL.*APPLE/i').first()
        await expect(option).toBeVisible({ timeout: 15000 })
      }
    }

    // Debug: take screenshot if needed
    if (process.env.CI) {
      await page.screenshot({ path: 'search-debug.png' })
    }
  })
})