import { defineConfig, devices } from "@playwright/test";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PORT = process.env.PORT ?? 3000;
const baseURL = `http://localhost:${PORT}`;

const NEXT_BUILD_E2E = process.env.NEXT_BUILD_E2E ?? "true";

const effectiveEnv = {
  NODE_OPTIONS: "--max-http-header-size=65536",
  DISABLE_SENTRY: "true",
  PORT: String(PORT),
  NEXT_BUILD_E2E,
  ...process.env,
};

export default defineConfig({
  testDir: path.join(__dirname, "e2e"),
  fullyParallel: true,
  forbidOnly: false,
  retries: 2,
  timeout: 90_000,
  workers: 1,
  reporter: "html",

  use: {
    baseURL,
    headless: true,
    trace: "on-first-retry",
  },

  projects: [
    { name: "chromium", use: devices["Desktop Chrome"] },
    { name: "firefox", use: devices["Desktop Firefox"] },
  ],

  webServer: {
    command: `sh -c 'NODE_OPTIONS="--max-http-header-size=65536" PORT=${PORT} npx vite preview --host 0.0.0.0 --port ${PORT}'`,
    url: baseURL,
    timeout: 120_000,
    reuseExistingServer: true,
    env: effectiveEnv,
  },
});
