// This file configures the initialization of Sentry on the client.
// The config you add here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/react/

/**
 * Extra notes:
 * This file is manually imported in the main entry point for Vite builds.
 * Source maps are handled by the Sentry Vite plugin during build time.
 * Reference: https://docs.sentry.io/platforms/javascript/sourcemaps/uploading/vite/
 */

import * as Sentry from "@sentry/react";
import { v4 as uuidv4 } from "uuid";

import { isProductionEnv } from "@/ui/common/config";
import { REPLAYS_ON_ERROR_RATE } from "@/ui/common/constants";
import { getCommitHash } from "@/ui/common/utils/version";

const SENTRY_DEVICE_ID_KEY = "sentry_device_id";

Sentry.init({
  enabled: Boolean(
    process.env.NEXT_PUBLIC_SIDECAR_API_URL &&
      process.env.NEXT_PUBLIC_SENTRY_DSN,
  ),
  // This is pointing to the DSN (Data Source Name) for my local instance.
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Tunnel endpoint for proxying Sentry events through our own server
  // This helps avoid ad-blockers and CSP issues
  tunnel: process.env.NEXT_PUBLIC_SIDECAR_API_URL
    ? `${process.env.NEXT_PUBLIC_SIDECAR_API_URL}/sentry-tunnel`
    : "http://localhost:8092/sentry-tunnel",

  // This environment variable is provided in the CI
  environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT ?? "local",

  // Ensure this release ID matches the one used during 'vite build' for source map uploads
  // It's passed via NEXT_PUBLIC_RELEASE_ID in the build environment (e.g., GitHub Actions)
  release: process.env.NEXT_PUBLIC_RELEASE_ID ?? "local-dev",

  // Ensure this dist ID matches the one used during 'vite build' for source map uploads
  // It's passed via NEXT_PUBLIC_DIST_ID in the build environment (e.g., GitHub Actions)
  dist: process.env.NEXT_PUBLIC_DIST_ID ?? "local",

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 1,
  tracesSampler: (samplingContext) => {
    const hasErrorTag = samplingContext.tags?.error === "true";

    // Only sample at 100% if it's an error transaction with the error tag
    if (hasErrorTag) {
      return 1.0;
    }

    // Default sampling rate for everything else
    return 0.01;
  },

  enableTracing: true,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  replaysOnErrorSampleRate: REPLAYS_ON_ERROR_RATE,

  replaysSessionSampleRate: 0,

  integrations: [
    Sentry.replayIntegration({
      // Additional Replay configuration goes in here, for example:
      maskAllText: isProductionEnv(),
      blockAllMedia: true,
    }),
    // Browser tracing for performance monitoring and React component annotation
    // (matching reactComponentAnnotation: { enabled: true } from original Next.js config)
    Sentry.browserTracingIntegration(),
  ],

  beforeSend(event, hint) {
    event.extra = {
      ...(event.extra || {}),
      version: getCommitHash(),
    };

    const exception = hint?.originalException as any;

    if (exception?.code) {
      event.fingerprint = ["{{ default }}", exception?.code];
    }

    return event;
  },
});

try {
  let deviceId = localStorage.getItem(SENTRY_DEVICE_ID_KEY);
  if (!deviceId) {
    deviceId = uuidv4();
    localStorage.setItem(SENTRY_DEVICE_ID_KEY, deviceId);
  }
  Sentry.setUser({ id: deviceId });
} catch (e) {
  Sentry.setUser({ id: uuidv4() });
}
