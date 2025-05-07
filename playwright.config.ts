import { defineConfig, devices } from "@playwright/test";
import { config as loadEnv } from "dotenv";
import path from "path";

loadEnv({ path: ".env.test", override: false });

const PORT = process.env.PORT ?? 3000;
const baseURL = `http://localhost:${PORT}`;

const effectiveEnv = {
  NODE_OPTIONS: "--max-http-header-size=65536",
  DISABLE_SENTRY: "true",
  PORT: String(PORT),
  ...process.env,
};

export default defineConfig({
  testDir: path.join(__dirname, "e2e"),
  fullyParallel: true,
  forbidOnly: false,
  retries: 2,
  timeout: 90_000,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",

  use: {
    baseURL,
    headless: false,
    trace: "on-first-retry",
  },

  projects: [{ name: "chromium", use: devices["Desktop Chrome"] }],

  webServer: {
    command: `sh -c 'NODE_OPTIONS="--max-http-header-size=65536" PORT=${PORT} npx next start -H 0.0.0.0 -p ${PORT}'`,
    url: baseURL,
    timeout: 120_000,
    reuseExistingServer: true,
    env: effectiveEnv,
  },
});
