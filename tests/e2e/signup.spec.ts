import { test, expect } from '@playwright/test'
import db from '@/lib/db'

test.describe('Sign up flow', () => {
  let testEmail = ''

  // After each test, clean up the test user from the database
  test.afterEach(() => {
    if (testEmail) {
      db.prepare('DELETE FROM users WHERE email = ?').run(testEmail)
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
    await page.fill('#password', 'securePass123')
    await page.fill('#confirmPassword', 'securePass123')

    // Wait for validation and button activation
    const submitButton = page.locator('button[type=submit]')
    await expect(submitButton).toBeEnabled()

    // Submit the form
    await submitButton.click()

    // Expect redirection to the dashboard
    await expect(page).toHaveURL('/dashboard')
  })
})
