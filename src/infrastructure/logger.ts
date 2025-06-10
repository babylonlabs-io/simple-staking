import { addBreadcrumb, captureException } from "@sentry/react";

// TODO: move errors from app folder
import { ClientError } from "@/app/errors";

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
        ? { ...tags, errorCode: (error as ClientError).errorCode }
        : tags,
      extra,
    }),
} as Infra.Logger;
