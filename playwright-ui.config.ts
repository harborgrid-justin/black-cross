/**
 * Playwright Configuration for UI Screenshot Testing
 * 
 * This configuration is used to capture screenshots of all user-accessible pages
 * in the Black-Cross platform.
 */

import { defineConfig, devices } from '@playwright/test';

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests/screenshots',
  
  /* Run tests in files sequentially to avoid conflicts */
  fullyParallel: false,
  
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  
  /* No retries for screenshot generation */
  retries: 0,
  
  /* Single worker for consistent screenshot generation */
  workers: 1,
  
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report-ui' }]
  ],
  
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: process.env.FRONTEND_URL || 'http://localhost:3000',
    
    /* Collect trace for debugging. */
    trace: 'on',
    
    /* Screenshot settings */
    screenshot: 'on',
    
    /* Video settings */
    video: 'retain-on-failure',
    
    /* Viewport size for consistent screenshots */
    viewport: { width: 1920, height: 1080 },
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  /* Run your local dev server before starting the tests */
  // Note: Servers should be started manually before running screenshots
  // This avoids TypeScript compilation issues during test execution
  // Start with: npm run dev (in separate terminal)
  // webServer: [
  //   {
  //     command: 'cd backend && npm run dev',
  //     url: 'http://localhost:8080/health',
  //     reuseExistingServer: true,
  //     timeout: 120 * 1000,
  //   },
  //   {
  //     command: 'cd frontend && npm run dev',
  //     url: 'http://localhost:3000',
  //     reuseExistingServer: true,
  //     timeout: 120 * 1000,
  //   },
  // ],

  /* Global timeout for each test */
  timeout: 60 * 1000,
  
  /* Global timeout for expect assertions */
  expect: {
    timeout: 10 * 1000,
  },
});
