import { test, expect } from '@playwright/test'
import bcrypt from 'bcrypt'
import deleteTestUserByEmail from '@/lib/test-helpers/delete-test-user'
import { insertUser } from '@/db/models/users'
import { User } from '@/types/user'


test.describe('Login and Logout flow (DB seeded)', () => {
  const TEST_EMAIL = `user${Date.now()}@example.com`
  const TEST_PASSWORD = 'securePass123'
  
  // Before the test, seed the user in the database
  test.beforeEach(() => {
    const passwordHash = bcrypt.hashSync(TEST_PASSWORD, 10)

    const user: User = {
    id: 123,
    email: TEST_EMAIL,
    password_hash: passwordHash,
    first_name: 'John',
    last_name: 'Doe',
    image: '',
    created_at:  new Date().toISOString(),
    }

    insertUser(user)
  })

  // After the test, clean up the user
  test.afterEach(() => {
    deleteTestUserByEmail(TEST_EMAIL)
  })

  test('user can log in and log out', async ({ page }) => {
    // Go to login page
    await page.goto('/')

    // Wait for login tab to appear and switch to Log In tab if needed
    const loginTab = page.getByRole('button', { name: /Sign In/i })
    await loginTab.waitFor({ state: 'visible' })
    if (await loginTab.isVisible()) {
      await loginTab.click()
    }

    // Wait for email and password fields to be attached to the DOM
    await page.waitForSelector('#email')
    await page.waitForSelector('#password')

    // Fill in login form
    await page.fill('#email', TEST_EMAIL)
    await page.fill('#password', TEST_PASSWORD)

    // Wait for login button to be enabled
    const loginButton = page.getByLabel('submit-signin')
    await page.waitForSelector('[aria-label="submit-signin"]:not([disabled])')

    // Click login button
    await expect(loginButton).toBeEnabled()
    await loginButton.click()

    // Expect redirect to dashboard
    await expect(page).toHaveURL('/dashboard')

    // Wait for logout button and click
    const logoutButton = page.getByRole('button', { name: /Log Out/i })
    await logoutButton.waitFor({ state: 'visible' })
    await logoutButton.click()

    // Expect redirect to home
    await expect(page).toHaveURL('/')
  })
})
