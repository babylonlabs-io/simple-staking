import { Page } from "@playwright/test";

/**
 * Sets up console log capturing for a page.
 * This will display all browser console logs in the test output.
 */
export function setupConsoleLogger(page: Page) {
  // Capture and display all console logs from the browser
  page.on("console", (msg) => {
    const type = msg.type();
    const text = msg.text();

    // Log to the terminal with the appropriate prefix
    console.log(`BROWSER_CONSOLE [${type}]: ${text}`);
  });
}
