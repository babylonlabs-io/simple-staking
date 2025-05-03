import * as Sentry from "@sentry/react";

type LogContext = Record<string, any>;

interface ErrorPayload {
  error: Error;
  tags?: Record<string, string | boolean | number> | string[];
  context?: LogContext;
  [key: string]: any;
}

class Logger {
  private _logBreadcrumb(
    level: Sentry.SeverityLevel,
    data: LogContext,
    defaultMessage: string,
  ): void {
    const { message: msg, ...contextData } = data;
    const message = msg ?? defaultMessage;

    Sentry.addBreadcrumb({
      category: "observability",
      message: String(message),
      level: level,
      data: contextData,
    });
  }

  public info(data: LogContext): void {
    this._logBreadcrumb("info", data, "Log info");
  }

  public warn(data: LogContext): void {
    this._logBreadcrumb("warning", data, "Log warning");
  }

  public error(payload: ErrorPayload): string | undefined {
    const { error, tags, ...contextData } = payload;

    return Sentry.captureException(error, (scope) => {
      if (tags) {
        let processedTags: Record<string, string | boolean | number> = {};
        if (Array.isArray(tags)) {
          tags.forEach((tag) => {
            processedTags[tag] = true;
          });
        } else {
          processedTags = tags;
        }
        scope.setTags(processedTags);
      }
      if (Object.keys(contextData).length > 0) {
        scope.setExtras(contextData);
      }
      return scope;
    });
  }
}

export const logger = new Logger();
