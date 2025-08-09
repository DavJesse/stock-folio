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
    // Mock search API
    await page.route('**/api/stocks/**', async route => {
      console.log('Intercepted search request:', route.request().url())
      const mockResults = [
        { symbol: 'AAPL', description: 'APPLE INC Common Stock', type: 'EQUITY' }
      ]
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockResults)
      })
    })

    // Mock buy API
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

    // Switch to Sign Up
    const signUpTab = page.getByRole('button', { name: /sign up/i })
    if (await signUpTab.isVisible()) await signUpTab.click()

    // Generate test email
    testEmail = `user${Date.now()}@example.com`

    // Fill signup form
    await page.fill('#firstName', 'John')
    await page.fill('#lastName', 'Doe')
    await page.fill('#email', testEmail)
    await page.fill('#password', 'secureP@ss123')
    await page.fill('#confirmPassword', 'secureP@ss123')

    const submitButton = page.getByLabel('submit-signup')
    await expect(submitButton).toBeEnabled()
    await submitButton.click()

    // Wait for dashboard
    await expect(page).toHaveURL('/dashboard')

    // Close popup
    const popup = page.getByRole('dialog')
    await expect(popup).toBeVisible()
    await popup.getByRole('button', { name: /close popup/i }).click()

    // Search for stock
    const searchInput = page.getByPlaceholder('Search stocks...')
    await searchInput.fill('aapl')

    // Wait for mocked results
    const listbox = page.getByRole('listbox')
    await expect(listbox).toBeVisible({ timeout: 10000 })

    const option = page.getByRole('option', { name: /AAPL APPLE INC Common Stock/i })
    await expect(option).toBeVisible()
    await option.click()

    // Verify modal
    const modalTitle = page.getByTestId('stock-symbol')
    await expect(modalTitle).toHaveText('AAPL')

    // Set quantity and buy
    await page.getByTestId('quantity-input').fill('5')
    const buyButton = page.getByRole('button', { name: /Buy 5 Share/i })
    await expect(buyButton).toBeVisible()
    await buyButton.click()

    // Success message
    await expect(page.getByText(/Successfully bought 5 shares of AAPL!/i)).toBeVisible()
  })
})
