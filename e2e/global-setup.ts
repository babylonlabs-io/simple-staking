import { FullConfig } from "@playwright/test";

/**
 * This global setup runs before all tests
 *
 * NOTE: To see browser console logs during tests, add the following to your test files:
 *
 * ```
 * import { setupConsoleLogger } from '../helper/console-logger';
 *
 * test.beforeEach(async ({ page }) => {
 *   setupConsoleLogger(page);
 *   // ... other setup code
 * });
 * ```
 */
async function globalSetup(config: FullConfig) {
  console.log("Global setup - Browser console logging helper ready");
  console.log("Import setupConsoleLogger from helper/console-logger");
  console.log(
    "Add setupConsoleLogger(page) in your test.beforeEach blocks to see E2E logs",
  );
}

export default globalSetup;
