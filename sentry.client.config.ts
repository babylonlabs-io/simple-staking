// This file configures the initialization of Sentry on the client.
// The config you add here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

/**
 * Extra notes:
 * This file is automatically included in the bundle by withSentryConfig() function
 * so it is not neccessary to create an instrumentation.ts for this file specifically.
 * Reference: https://github.com/getsentry/sentry-javascript/blob/afa79b68640caf7ea3f3bc91c584e92225a49bc8/packages/nextjs/src/config/webpack.ts#L379
 */

import * as Sentry from "@sentry/nextjs";

import { getCommitHash } from "@/utils/version";

Sentry.init({
  // This is pointing to the DSN (Data Source Name) for my local instance.
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // This environment variable is provided in the CI
  environment: process.env.environment ?? "local",

  // This can be used to detech regression across releases
  // Reference: https://docs.github.com/en/actions/writing-workflows/choosing-what-your-workflow-does/store-information-in-variables#default-environment-variables
  release: process.env.GITHUB_SHA ?? "NA",

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 1,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
  replaysOnErrorSampleRate: 1.0,

  // This sets the sample rate to be 10%. You may want this to be 100% while
  // in development and sample at a lower rate in production
  replaysSessionSampleRate: 0.1,

  // You can remove this option if you're not planning to use the Sentry Session Replay feature:
  integrations: [
    Sentry.replayIntegration({
      // Additional Replay configuration goes in here, for example:
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],

  beforeSend(event) {
    event.extra = {
      ...event.extra,
      version: getCommitHash(),
    };
    return event;
  },
});
