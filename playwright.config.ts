import { defineConfig, devices } from "@playwright/test";
import path from "path";

// Use process.env.PORT by default and fallback to port 3000
const PORT = process.env.PORT || 3000;

// Set webServer.url and use.baseURL with the location of the WebServer respecting the correct set port
const baseURL = `http://localhost:${PORT}`;

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  // Test directory
  testDir: path.join(__dirname, "e2e"),
  // Output directory for test artifacts
  outputDir: path.join(__dirname, "test-results"),
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: false,
  /* Retry on CI only */
  retries: 2,
  // Use longer timeout in CI environments
  timeout: process.env.CI ? 120 * 1000 : 90 * 1000,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: "html",
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    // Use baseURL so to make navigations relative.
    // More information: https://playwright.dev/docs/api/class-testoptions#test-options-base-url
    baseURL,

    // Run tests in headful mode locally for easier debugging, but keep the
    // default headless mode on CI.
    headless: process.env.CI ? true : undefined,

    // Wait for all network resources to load before considering navigation complete
    navigationTimeout: 60000,

    // Improve resource loading reliability
    contextOptions: {
      // Skip waiting for main resources that might 404 in development mode
      bypassCSP: true,
    },

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },

    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },

    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    // Use development server in CI to avoid memory issues with Next.js build
    command: process.env.CI
      ? `sh -c 'NODE_OPTIONS="--max-http-header-size=65536" PORT=${PORT} npx next dev -H 0.0.0.0 -p ${PORT}'`
      : `sh -c 'npm run build && NODE_OPTIONS="--max-http-header-size=65536" PORT=${PORT} npx next start -H 0.0.0.0 -p ${PORT}'`,
    url: baseURL,
    // Increase timeout for CI to ensure dev server has time to fully start
    timeout: process.env.CI ? 180 * 1000 : 120 * 1000,
    // In CI, wait for the server to be fully ready before running tests
    reuseExistingServer: !process.env.CI,
    env: {
      NODE_OPTIONS: "--max-http-header-size=65536",
      // Disable Sentry during E2E tests to reduce noise and improve performance
      DISABLE_SENTRY: "true",
      PORT: String(PORT),
    },
  },
});
