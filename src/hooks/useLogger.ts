import { addBreadcrumb, captureException, SeverityLevel } from "@sentry/nextjs";

type Context = Record<string, number | string | boolean> & {
  category?: string;
};

type ErrorContext = {
  level?: SeverityLevel;
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
    addBreadcrumb({
      level: "info",
      message,
      category,
      data,
    }),
  warn: (message, { category, ...data } = {}) =>
    addBreadcrumb({
      level: "warning",
      message,
      category,
      data,
    }),
  error: (error, { level = "error", tags, data: extra } = {}) =>
    captureException(error, {
      level,
      tags,
      extra,
    }),
};

export function useLogger(): Logger {
  return logger;
}
