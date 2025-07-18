import { test, expect } from '@playwright/test'
import bcrypt from 'bcrypt'
import db from '@/lib/db'

const TEST_EMAIL = 'e2e_user@example.com'
const TEST_PASSWORD = 'password123'

test.describe('Sign in flow with seeded user', () => {
  test.beforeEach(async () => {
    // Hash the password to match production format
    const passwordHash = await bcrypt.hash(TEST_PASSWORD, 10)

    // Seed the test user into the database with current local time
    db.prepare(`
      INSERT INTO users (email, password_hash, created_at)
      VALUES (?, ?, datetime('now', 'localtime'))
    `).run(TEST_EMAIL, passwordHash)
  })

  test.afterEach(() => {
    // Clean up: remove the test user after each test
    db.prepare('DELETE FROM users WHERE email = ?').run(TEST_EMAIL)
  })

  test('user can log in and see dashboard', async ({ page }) => {
    // Navigate to the root page
    await page.goto('/')

    // If not already on the login tab, click the "Sign In" tab
    const signInTab = page.getByRole('button', { name: /Sign In/i })
    await signInTab.click()

    // Wait for the login form to be ready
    await page.getByLabel('Email').waitFor()

    // Fill out login credentials
    await page.getByLabel('Email').fill(TEST_EMAIL)
    await page.getByLabel('Password').fill(TEST_PASSWORD)

    // Submit the login form
    const loginButton = page.getByLabel('submit-signin')
    await expect(loginButton).toBeEnabled()
    await loginButton.click()

    // Expect to be redirected to the dashboard on successful login
    await expect(page).toHaveURL(/\/dashboard/)
  })
})
