/**
 * Helper function to determine URL based on environment variables
 *
 * @param envVar The environment variable containing a potential URL value
 * @param localUrl The URL to use in CI/testing environments
 * @param prodUrl The URL to use in production
 * @returns The appropriate URL based on the environment
 */
export const getUrlFromEnv = (
  envVar: string | undefined,
  localUrl: string,
  prodUrl: string,
): string => {
  if (envVar && envVar !== "/") {
    return envVar;
  }

  if (import.meta.env.CI || import.meta.env.NEXT_BUILD_E2E) {
    return localUrl;
  }

  return prodUrl;
};
