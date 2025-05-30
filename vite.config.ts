import { sentryVitePlugin } from "@sentry/vite-plugin";
import react from "@vitejs/plugin-react";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import EnvironmentPlugin from "vite-plugin-environment";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import tsconfigPaths from "vite-tsconfig-paths";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Skip Sentry during E2E builds or when DISABLE_SENTRY flag is set (matching original Next.js config)
const isSentryDisabled =
  process.env.NEXT_BUILD_E2E || process.env.DISABLE_SENTRY === "true";

// Only enable Sentry plugin when not disabled and required env vars are available
const enableSentryPlugin =
  !isSentryDisabled &&
  Boolean(
    process.env.SENTRY_AUTH_TOKEN &&
      process.env.SENTRY_ORG &&
      process.env.SENTRY_PROJECT,
  );

// https://vite.dev/config/
export default defineConfig({
  build: {
    sourcemap: enableSentryPlugin,
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        404: resolve(__dirname, "404.html"),
      },
    },
  },
  plugins: [
    react(),
    tsconfigPaths(),
    nodePolyfills({ include: ["buffer"] }),
    EnvironmentPlugin("all", { prefix: "NEXT_PUBLIC_" }),
    ...(enableSentryPlugin
      ? [
          sentryVitePlugin({
            org: process.env.SENTRY_ORG,
            project: process.env.SENTRY_PROJECT,
            authToken: process.env.SENTRY_AUTH_TOKEN,
            url: process.env.SENTRY_URL,
            release: {
              name: process.env.SENTRY_RELEASE,
              dist: process.env.SENTRY_DIST,
            },
            sourcemaps: {
              assets: "./dist/**",
            },
            silent: !process.env.CI,
            telemetry: false,
            errorHandler: (err) => {
              // Don't fail the build if Sentry operations fail (matching original error handling)
              console.warn("⚠️ Sentry encountered an error during build:");
              console.warn("⚠️", err.message);
            },
          }),
        ]
      : []),
  ],
  define: {
    "import.meta.env.NEXT_PUBLIC_COMMIT_HASH": JSON.stringify(
      process.env.NEXT_PUBLIC_COMMIT_HASH || "development",
    ),
    "process.env.NEXT_TELEMETRY_DISABLED": JSON.stringify("1"),
  },
});
