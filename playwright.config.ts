import { defineConfig, devices } from '@playwright/test';

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['json', { outputFile: 'playwright-report/results.json' }],
    ['junit', { outputFile: 'playwright-report/results.xml' }],
    process.env.CI ? ['github'] : ['list']
  ],
  
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    // Global test timeout
    actionTimeout: 10000,
    navigationTimeout: 30000,
  },

  // Configure global setup and teardown
  globalSetup: require.resolve('./tests/fixtures/global-setup.ts'),
  globalTeardown: require.resolve('./tests/fixtures/global-teardown.ts'),

  projects: [
    // Setup project for authentication
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },

    // Desktop browsers
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        storageState: 'tests/fixtures/auth.json',
      },
      dependencies: ['setup'],
    },
    {
      name: 'firefox',
      use: { 
        ...devices['Desktop Firefox'],
        storageState: 'tests/fixtures/auth.json',
      },
      dependencies: ['setup'],
    },
    {
      name: 'webkit',
      use: { 
        ...devices['Desktop Safari'],
        storageState: 'tests/fixtures/auth.json',
      },
      dependencies: ['setup'],
    },

    // Mobile devices
    {
      name: 'Mobile Chrome',
      use: { 
        ...devices['Pixel 5'],
        storageState: 'tests/fixtures/auth.json',
      },
      dependencies: ['setup'],
    },
    {
      name: 'Mobile Safari',
      use: { 
        ...devices['iPhone 12'],
        storageState: 'tests/fixtures/auth.json',
      },
      dependencies: ['setup'],
    },

    // Visual regression testing
    {
      name: 'visual-chromium',
      use: { 
        ...devices['Desktop Chrome'],
        storageState: 'tests/fixtures/auth.json',
      },
      testMatch: /.*visual.*\.spec\.ts/,
      dependencies: ['setup'],
    },

    // API testing
    {
      name: 'api',
      use: {
        baseURL: process.env.API_BASE_URL || 'http://localhost:8000',
      },
      testMatch: /.*api.*\.spec\.ts/,
    },
  ],

  // Configure local dev server
  webServer: process.env.CI ? undefined : {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },

  // Expect options for visual testing
  expect: {
    // Threshold for visual comparisons
    threshold: 0.2,
    // Compare screenshots pixel by pixel
    toHaveScreenshot: { 
      threshold: 0.2, 
      maxDiffPixels: 100,
      animations: 'disabled',
    },
    toMatchSnapshot: { 
      threshold: 0.2,
      maxDiffPixels: 200,
    },
  },

  // Test metadata
  metadata: {
    'test-environment': process.env.NODE_ENV || 'development',
    'base-url': process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
    'api-url': process.env.API_BASE_URL || 'http://localhost:8000',
  },
}); 