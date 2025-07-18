import { test, expect } from '@playwright/test'
import bcrypt from 'bcrypt'
import db from '@/lib/db'

test.describe('Login and Logout flow (DB seeded)', () => {
  const TEST_EMAIL = `user${Date.now()}@example.com`
  const TEST_PASSWORD = 'securePass123'

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

  test('user can log in and log out', async ({ page }) => {
    // Go to login page
    await page.goto('/')

    // Switch to Log In tab if needed
    const loginTab = page.getByRole('button', { name: /Sign In/i })
    if (await loginTab.isVisible()) {
      await loginTab.click()
    }

    // Fill in login form
    await page.fill('#email', TEST_EMAIL)
    await page.fill('#password', TEST_PASSWORD)

    // Wait for validation or state update
    await page.waitForTimeout(300)

    // Click login button
    const loginButton = page.getByLabel('submit-signin')
    await expect(loginButton).toBeEnabled()
    await loginButton.click()

    // Expect redirect to dashboard
    await expect(page).toHaveURL('/dashboard')

    // Click logout button
    const logoutButton = page.getByRole('button', { name: /Log Out/i })
    await logoutButton.click()

    // Expect redirect to home
    await expect(page).toHaveURL('/')
  })
})
