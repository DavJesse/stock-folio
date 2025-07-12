import { test, expect } from '@playwright/test';

// E2E test: verifies user signup flow and dashboard redirection
test('user can sign up and see dashboard', async ({ page }) => {
    await page.goto('/'); // Start from the home page

    await page.getByText('Sign Up').click(); // Navigate to the signup form

    await page.fill('#email', 'test@example.com'); // Use a test email for signup
    await page.fill('#password', 'securePass123'); // Use a strong test password

    await page.click('button[type=submit]'); // Submit the signup form

    // Assert that the user is redirected to the dashboard after successful signup
    await expect(page).toHaveURL('/dashboard');
});
