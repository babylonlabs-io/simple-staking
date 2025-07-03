import { sentryVitePlugin } from "@sentry/vite-plugin";
import react from "@vitejs/plugin-react";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import EnvironmentPlugin from "vite-plugin-environment";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import { VitePluginRadar } from "vite-plugin-radar";
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
    outDir: "out",
    sourcemap: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        404: resolve(__dirname, "404.html"),
      },
      output: {
        manualChunks: {
          react: ["react", "react-dom"],
          bitcoin: ["@bitcoin-js/tiny-secp256k1-asmjs", "bitcoinjs-lib"],
          cosmos: ["@cosmjs/proto-signing", "@cosmjs/stargate"],
          babylon: [
            "@babylonlabs-io/babylon-proto-ts",
            "@babylonlabs-io/btc-staking-ts",
            "@babylonlabs-io/core-ui",
          ],
          wallets: ["@babylonlabs-io/wallet-connector"],
        },
      },
    },
  },
  plugins: [
    react(),
    tsconfigPaths(),
    nodePolyfills({ include: ["buffer", "crypto"] }),
    EnvironmentPlugin("all", { prefix: "NEXT_PUBLIC_" }),
    sentryVitePlugin({
      disable: !enableSentryPlugin,
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
    VitePluginRadar({
      analytics: {
        id: process.env.GA4_MEASUREMENT_ID ?? "",
        disable: !process.env.GA4_MEASUREMENT_ID,
        config: {
          cookie_flags: "SameSite=None;Secure",
          cookie_domain: "babylonlabs.io",
        },
      },
    }),
  ],
  define: {
    "import.meta.env.NEXT_PUBLIC_COMMIT_HASH": JSON.stringify(
      process.env.NEXT_PUBLIC_COMMIT_HASH || "development",
    ),
    "import.meta.env.NEXT_PUBLIC_CANONICAL": JSON.stringify(
      process.env.NEXT_PUBLIC_CANONICAL || "https://babylonlabs.io/",
    ),
    "process.env.NEXT_TELEMETRY_DISABLED": JSON.stringify("1"),
  },
});
