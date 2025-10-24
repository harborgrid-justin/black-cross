/**
 * Playwright Configuration for API Testing
 * 
 * This configuration sets up 8 parallel workers to test communication
 * between the frontend and backend APIs.
 */

import { defineConfig, devices } from '@playwright/test';

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests/api',
  
  /* Run tests in files in parallel */
  fullyParallel: true,
  
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 4 : 8,
  
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['list']
  ],
  
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: process.env.BACKEND_URL || 'http://localhost:8080',
    
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    
    /* API testing specific settings */
    extraHTTPHeaders: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
  },

  /* Configure projects for major browsers - API tests don't need browser rendering */
  projects: [
    {
      name: 'api-tests',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  /* Run your local dev server before starting the tests */
  // Servers should be started manually or already running
  // webServer: [
  //   {
  //     command: 'cd backend && npm run dev',
  //     url: 'http://localhost:8080/health',
  //     reuseExistingServer: !process.env.CI,
  //     timeout: 120 * 1000,
  //     stdout: 'pipe',
  //     stderr: 'pipe',
  //   },
  //   {
  //     command: 'cd frontend && npm run dev',
  //     url: 'http://localhost:3000',
  //     reuseExistingServer: !process.env.CI,
  //     timeout: 120 * 1000,
  //     stdout: 'pipe',
  //     stderr: 'pipe',
  //   },
  // ],

  /* Global timeout for each test */
  timeout: 30 * 1000,
  
  /* Global timeout for expect assertions */
  expect: {
    timeout: 10 * 1000,
  },
});
