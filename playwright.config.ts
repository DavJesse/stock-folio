import { defineConfig } from '@playwright/test';

// Playwright configuration file
export default defineConfig({
    // Directory containing test files
    testDir: './tests',
    // Maximum time allowed for a single test (milliseconds)
    timeout: 30 * 1000,
    // Number of retries per test on failure
    retries: 1,
    use: {
        // Base URL for all tests
        baseURL: 'http://localhost:3000',
        // Run tests in headless mode
        headless: true,
        // Default browser viewport size
        viewport: { width: 1280, height: 720 },
        // Maximum time for each action (0 = unlimited)
        actionTimeout: 0,
        // Ignore HTTPS errors during tests
        ignoreHTTPSErrors: true,
        // Capture screenshot only on test failure
        screenshot: 'only-on-failure',
        // Retain video only on test failure
        video: 'retain-on-failure',
    },
    webServer: {
        // Command to start the development server before tests
        command: 'npm run dev',
        // Port to use for the development server
        port: 3000,
        // Maximum time to wait for the server to start (milliseconds)
        timeout: 120 * 1000,
        // Reuse existing server unless running in CI environment
        reuseExistingServer: !process.env.CI,
    },
});
