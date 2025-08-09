import { test, expect } from '@playwright/test'
import deleteTestUserByEmail from '@/lib/test-helpers/delete-test-user'

test.describe('E2E: Stock buy', () => {
  let testEmail = ''

  test.afterEach(() => {
    if (testEmail) {
      deleteTestUserByEmail(testEmail)
    }
  })

  test('logs in, searches for stock, opens modal, and buys shares', async ({ page }) => {
    // Set up mocks BEFORE navigation
    await page.route('**/api/stocks/**', async route => {
      console.log('Intercepted search request:', route.request().url())
      // Add small delay to simulate real API
      await new Promise(resolve => setTimeout(resolve, 100))
      const mockResults = [
        { symbol: 'AAPL', description: 'APPLE INC Common Stock', type: 'EQUITY' }
      ]
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockResults)
      })
    })

    await page.route('**/api/transactions/buy', async route => {
      console.log('Intercepted buy request:', route.request().url())
      const body = await route.request().postDataJSON()
      console.log('Buy request body:', body)
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          cash_balance: 10000 - body.quantity * body.price,
          portfolio: { symbol: body.symbol, quantity: body.quantity, average_price: body.price }
        })
      })
    })

    // Navigate to homepage
    await page.goto('/')

    // Switch to Sign Up with better waiting
    const signUpTab = page.getByRole('button', { name: /sign up/i })
    await signUpTab.waitFor({ state: 'visible' })
    await signUpTab.click()

    // Generate test email
    testEmail = `user${Date.now()}@example.com`

    // Fill signup form with individual waits
    await page.waitForSelector('#firstName')
    await page.fill('#firstName', 'John')
    await page.fill('#lastName', 'Doe')
    await page.fill('#email', testEmail)
    await page.fill('#password', 'secureP@ss123')
    await page.fill('#confirmPassword', 'secureP@ss123')

    const submitButton = page.getByLabel('submit-signup')
    await expect(submitButton).toBeEnabled({ timeout: 10000 })
    await submitButton.click()

    // Wait for dashboard with longer timeout
    await expect(page).toHaveURL('/dashboard', { timeout: 15000 })

    // Close popup with better error handling
    try {
      const popup = page.getByRole('dialog')
      await expect(popup).toBeVisible({ timeout: 5000 })
      const closeButton = popup.getByRole('button', { name: /close popup/i })
      await closeButton.waitFor({ state: 'visible' })
      await closeButton.click()
    } catch (e) {
      console.log('No popup to close or popup already closed: ', e)
    }

    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle')

    // Search for stock with better waits
    const searchInput = page.getByPlaceholder('Search stocks...')
    await searchInput.waitFor({ state: 'visible' })
    await searchInput.click() // Ensure focus
    await searchInput.fill('aapl')

    // Wait for search to trigger (debounce)
    await page.waitForTimeout(500)

    // Try multiple selectors for the dropdown
    let listbox
    try {
      listbox = page.getByRole('listbox')
      await expect(listbox).toBeVisible({ timeout: 15000 })
    } catch (e) {
      console.log('Listbox not found by role, trying other selectors:', e)
      // Fallback: look for any dropdown container
      listbox = page.locator('[role="listbox"], .search-dropdown, .dropdown-menu').first()
      await expect(listbox).toBeVisible({ timeout: 15000 })
    }

    // Try multiple ways to find the option
    let option
    try {
      option = page.getByRole('option', { name: /AAPL.*APPLE INC/i })
      await expect(option).toBeVisible({ timeout: 10000 })
    } catch (e) {
      console.log('Option not found by role, trying text selector:', e)
      // Fallback to broader selector
      option = page.locator('text=/AAPL.*APPLE/i').first()
      await expect(option).toBeVisible({ timeout: 10000 })
    }
    
    await option.click()

    // Verify modal with longer timeout
    const modalTitle = page.getByTestId('stock-symbol')
    await expect(modalTitle).toBeVisible({ timeout: 10000 })
    await expect(modalTitle).toHaveText('AAPL')

    // Set quantity and buy
    const quantityInput = page.getByTestId('quantity-input')
    await quantityInput.waitFor({ state: 'visible' })
    await quantityInput.fill('5')

    const buyButton = page.getByRole('button', { name: /Buy 5 Share/i })
    await expect(buyButton).toBeVisible()
    await buyButton.click()

    // Success message with longer timeout
    await expect(page.getByText(/Successfully bought 5 shares of AAPL!/i)).toBeVisible({ timeout: 10000 })
  })
})
