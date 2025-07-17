import { test, expect } from '@playwright/test'

test('user can log in and see dashboard', async ({ page }) => {
  // Visit home page
  await page.goto('/')

  // If not defaulted to login tab, click "Sign In" tab
  const signInTab = page.getByRole('button', { name: /sign in/i })
  if (await signInTab.isVisible()) {
    await signInTab.click()
  }

  // Fill in credentials
  await page.getByLabel('Email').fill('e2e_user@example.com')
  await page.getByLabel('Password').fill('password123')

  // Submit form
  await page.getByRole('button', { name: /log in/i }).click()

  // Expect to see confirmation
  await expect(page.getByText(/Login successful!/i)).toBeVisible()

  // Redirect to dashboard
  await expect(page).toHaveURL(/dashboard/i)
})
