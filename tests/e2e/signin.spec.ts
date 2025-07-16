// tests/e2e/login.spec.ts
import { test, expect } from '@playwright/test'

test('user can log in and see dashboard', async ({ page }) => {
  // Navigate to the home page
  await page.goto('/')

  // Click on the "Log In" button/link if needed
  await page.getByText(/log in/i).click()

  // Fill out the login form
  await page.fill('#email', 'e2e_user@example.com')
  await page.fill('#password', 'password123')

  // Submit the form
  await page.getByRole('button', { name: /log in/i }).click()

  // Expect success message or redirection
  await expect(page.getByText(/login successful/i)).toBeVisible()

  // Optional: Check dashboard or protected content
  // await expect(page.getByText(/welcome|dashboard/i)).toBeVisible()
})
