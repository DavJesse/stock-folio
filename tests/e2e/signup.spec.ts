// tests/e2e/signup.spec.ts
import { test, expect } from '@playwright/test'

// E2E test: verifies user signup flow and dashboard redirection
test('user can sign up and see dashboard', async ({ page }) => {
  await page.goto('/') // Navigate to homepage

  // Switch to Sign Up tab if needed
  const signUpTab = page.getByRole('button', { name: /sign up/i })
  if (await signUpTab.isVisible()) {
    await signUpTab.click()
  }

  const email = `user${Date.now()}@example.com`
  // Fill out signup form
  await page.fill('#email', email)
  await page.fill('#password', 'securePass123')
  await page.fill('#confirmPassword', 'securePass123')

  // Wait for validation to complete and button to be enabled
  const submitButton = page.locator('button[type=submit]')
  await expect(submitButton).toBeEnabled()

  // Submit the form
  await submitButton.click()

  // Verify redirection to dashboard
  await expect(page).toHaveURL('/dashboard')
})
