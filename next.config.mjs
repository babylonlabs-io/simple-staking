import { withSentryConfig } from "@sentry/nextjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: false,
  output: process.env.NEXT_BUILD_E2E == "true" ? undefined : "export",
  images: { unoptimized: true },
  productionBrowserSourceMaps: true,
  experimental: {
    forceSwcTransforms: true,
  },
  webpack(config, { dev, isServer }) {
    if (!dev && !isServer) {
      config.module.rules.push({
        test: /\.js$/,
        enforce: "pre",
        use: ["source-map-loader"],
        exclude: /node_modules\/(?!@babylonlabs-io)/,
      });
    }

    return config;
  },
  // Set environment variables to suppress warnings and improve test reliability
  env: {
    NEXT_TELEMETRY_DISABLED: "1",
  },
};

// Skip Sentry during the E2E build or when the DISABLE_SENTRY flag is set to avoid warnings and speed up builds/tests
const isSentryDisabled = process.env.NEXT_BUILD_E2E || process.env.DISABLE_SENTRY === "true";

const config = isSentryDisabled
  ? nextConfig
  : withSentryConfig(nextConfig, {
    // For all available options, see:
    // https://github.com/getsentry/sentry-webpack-plugin#options

    org: process.env.SENTRY_ORG,
    project: process.env.SENTRY_PROJECT,
    authToken: process.env.SENTRY_AUTH_TOKEN,
    sentryUrl: process.env.SENTRY_URL, // Only needed if using self-hosted Sentry
    release: {
      name: process.env.SENTRY_RELEASE,
      dist: process.env.SENTRY_DIST,
    },

    sourcemaps: {
      disable: false,
      deleteSourceMapsAfterUpload: false,
    },

    // Only print logs for uploading source maps in CI
    silent: !process.env.CI,

    // Don't fail the build if Sentry operations fail
    unstable_sentryWebpackPluginOptions: {
      errorHandler: (err) => {
        console.warn('⚠️ Sentry encountered an error during build:');
        console.warn('⚠️', err.message);
      },
    },

    // For all available options, see:
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

    // Upload a larger set of source maps for prettier stack traces (increases build time)
    widenClientFileUpload: true,

    // Automatically annotate React components to show their full name in breadcrumbs and session replay
    reactComponentAnnotation: {
      enabled: true,
    },

    // Uncomment to route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
    // This can increase your server load as well as your hosting bill.
    // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
    // side errors will fail.
    // tunnelRoute: "/monitoring",

    // Automatically tree-shake Sentry logger statements to reduce bundle size
    disableLogger: true,

    // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
    // See the following for more information:
    // https://docs.sentry.io/product/crons/
    // https://vercel.com/docs/cron-jobs
    automaticVercelMonitors: false,
  });

export default config;