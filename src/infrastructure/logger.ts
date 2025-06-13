import { addBreadcrumb, captureException } from "@sentry/react";

export default {
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
      tags: Reflect.has(error, "errorCode")
        ? { ...tags, errorCode: Reflect.get(error, "errorCode") }
        : tags,
      extra,
    }),
} satisfies Infra.Logger;
