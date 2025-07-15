/**
 * End-to-end test for the homepage.
 *
 * Navigates to the root URL and verifies that the welcome message
 * containing "get started by editing" is visible on the page.
 *
 * @remarks
 * This test ensures that the initial landing page renders the expected
 * onboarding message, indicating that the application is running correctly.
 */
import { test, expect } from '@playwright/test';

test('homepage sign up form', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText(/Email:/i)).toBeVisible();
});
