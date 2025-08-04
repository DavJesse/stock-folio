import { test, expect } from '@playwright/test'
import deleteTestUserByEmail from '@/lib/test-helpers/delete-test-user'

test.describe('E2E: Stock buy', () => {
  let testEmail = ''

  // After each test, clean up the test user from the database
  test.afterEach(() => {
    if (testEmail) {
      deleteTestUserByEmail(testEmail)
    }
  })

  test('logs in, searches for stock, opens modal, and buys shares', async ({ page }) => {
    // Navigate to homepage
    await page.goto('/')

    // Switch to Sign Up tab if not selected by default
    const signUpTab = page.getByRole('button', { name: /sign up/i })
    if (await signUpTab.isVisible()) {
      await signUpTab.click()
    }

    // Generate a unique test email using timestamp
    testEmail = `user${Date.now()}@example.com`

    // Fill out the signup form
    await page.fill('#firstName', 'John')
    await page.fill('#lastName', 'Doe')
    await page.fill('#email', testEmail)
    await page.fill('#password', 'secureP@ss123')
    await page.fill('#confirmPassword', 'secureP@ss123')

    // Wait for validation and button activation
   const submitButton = page.getByLabel('submit-signup')
   await expect(submitButton).toBeEnabled()

    // Submit the form
    await submitButton.click()

    // Expect redirection to the dashboard
    await expect(page).toHaveURL('/dashboard')

    // Wait for popup with "Congratulations!" or 🎉 emoji
    const popup = page.getByRole('dialog')
    await expect(popup).toBeVisible()
    await expect(popup).toContainText('Congratulations!')
    await expect(popup).toBeVisible()

    // Check popup contains message
    await expect(popup).toContainText('Congratulations!')
    await expect(popup).toContainText('🎉')

    // Close the popup
    const closeButton = popup.getByRole('button', { name: /close popup/i })
    await closeButton.click()

    const searchInput = page.getByPlaceholder('Search stocks...')
    await searchInput.fill('aapl')

    await page.waitForTimeout(1200)

    // Wait for results to appear
    await expect(page.getByRole('listbox')).toBeVisible()

    // Click on the stock result using role and accessible name
    const option = page.getByRole('option', { name: /AAPL APPLE INC Common Stock/i })
    await expect(option).toBeVisible()
    await option.click()

    // Wait for the modal to appear
    const modalTitle = page.getByTestId('stock-symbol')
    await expect(modalTitle).toHaveText('AAPL')

    // Set quantity to 5
    const quantityInput = page.getByTestId('quantity-input')
    await quantityInput.fill('5')

    // Click the Buy button
    const buyButton = page.getByRole('button', { name: /Buy 5 Share/i })
    await expect(buyButton).toBeVisible()
    await buyButton.click()

    // Check for success message
    await expect(page.getByText('Successfully bought 5 shares of AAPL!')).toBeVisible()
  })
})
