import { test, expect } from '@playwright/test'
import deleteTestUserByEmail from '@/lib/test-helpers/delete-test-user'

test.describe('Sign up flow', () => {
  let testEmail = ''

  // After each test, clean up the test user from the database
  test.afterEach(() => {
    if (testEmail) {
      deleteTestUserByEmail(testEmail)
    }
  })

  test('user can sign up and see dashboard', async ({ page }) => {
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

    // Verify it disappears
    await expect(popup).toBeHidden()
  })
})
