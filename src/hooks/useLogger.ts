import * as Sentry from "@sentry/nextjs";

type Context = Record<string, number | string | boolean> & {
  category?: string;
};

type ErrorContext = {
  level?: Sentry.SeverityLevel;
  tags?: Record<string, string>;
  data?: Record<string, string | number | boolean>;
};

interface Logger {
  info(message: string, context?: Context): void;
  warn(message: string, context?: Context): void;
  error(error: Error, context?: ErrorContext): string;
}

const logger: Logger = {
  info: (message, { category, ...data } = {}) =>
    Sentry.addBreadcrumb({
      level: "info",
      message,
      category,
      data,
    }),
  warn: (message, { category, ...data } = {}) =>
    Sentry.addBreadcrumb({
      level: "warning",
      message,
      category,
      data,
    }),
  error: (error, { level = "error", tags, data: extra } = {}) =>
    Sentry.captureException(error, {
      level,
      tags,
      extra,
    }),
};

export function useLogger(): Logger {
  return logger;
}
