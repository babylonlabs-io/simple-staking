// This file configures the initialization of Sentry on the client.
// The config you add here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

/**
 * Extra notes:
 * This file is automatically included in the bundle by withSentryConfig() function
 * so it is not necessary to create an instrumentation.ts for this file specifically.
 * Reference: https://github.com/getsentry/sentry-javascript/blob/afa79b68640caf7ea3f3bc91c584e92225a49bc8/packages/nextjs/src/config/webpack.ts#L379
 */

import * as Sentry from "@sentry/nextjs";
import { v4 as uuidv4 } from "uuid";

import { REPLAYS_ON_ERROR_RATE } from "@/app/constants";
import { isProductionEnv } from "@/config";
import { getCommitHash } from "@/utils/version";

const SENTRY_DEVICE_ID_KEY = "sentry_device_id";

Sentry.init({
  enabled: Boolean(
    import.meta.env.VITE_SIDECAR_API_URL && import.meta.env.VITE_SENTRY_DSN,
  ),
  // This is pointing to the DSN (Data Source Name) for my local instance.
  dsn: import.meta.env.VITE_SENTRY_DSN,

  // Tunnel endpoint for proxying Sentry events through our own server
  // This helps avoid ad-blockers and CSP issues
  tunnel: import.meta.env.VITE_SIDECAR_API_URL
    ? `${import.meta.env.VITE_SIDECAR_API_URL}/sentry-tunnel`
    : "http://localhost:8092/sentry-tunnel",

  // This environment variable is provided in the CI
  environment: import.meta.env.VITE_SENTRY_ENVIRONMENT ?? "local",

  // Ensure this release ID matches the one used during 'next build' for source map uploads
  // It's passed via VITE_RELEASE_ID in the build environment (e.g., GitHub Actions)
  release: import.meta.env.VITE_RELEASE_ID ?? "local-dev",

  // Ensure this dist ID matches the one used during 'next build' for source map uploads
  // It's passed via VITE_DIST_ID in the build environment (e.g., GitHub Actions)
  dist: import.meta.env.VITE_DIST_ID ?? "local",

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
