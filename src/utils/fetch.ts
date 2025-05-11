import { HttpStatusCode } from "@/app/api/httpStatusCodes";
import { ServerError } from "@/app/context/Error/errors";
import { ClientError, ERROR_CODES } from "@/errors";

type FetchOptions = {
  method?: Request["method"];
  body?: BodyInit;
  headers?: HeadersInit;
  parseAs?: "json" | "text";
  formatErrorResponse?: (errorText: string) => string;
};

/**
 * Wrapper for fetch with standardized error handling and response parsing
 * @param url - The URL to fetch from
 * @param options - Fetch options for API requests
 * @returns Promise resolving to the parsed response
 */
export const fetchApi = async <T>(
  url: URL,
  { parseAs = "json", ...options }: FetchOptions = {},
): Promise<T> => {
  try {
    const response = await fetch(url, {
      method: options?.method || "GET",
      headers: options?.headers,
      body: options?.body,
    });

    if (!response.ok) {
      const errorText =
        (await response.text()) || JSON.stringify(await response.json());
      const message = options.formatErrorResponse?.(errorText) || errorText;
      throw new ClientError(ERROR_CODES.EXTERNAL_SERVICE_UNAVAILABLE, message, {
        metadata: {
          httpStatus: response.status,
          endpoint: url.toString(),
          responseBody: errorText,
        },
      });
    }

    const data =
      parseAs === "text" ? await response.text() : await response.json();

    return data as T;
  } catch (error) {
    if (error instanceof ClientError) throw error;
    if (error instanceof ServerError) {
      const message = error.message || "Unknown server error during fetch";
      throw new ClientError(ERROR_CODES.CONNECTION_ERROR, message, {
        metadata: {
          originalErrorName: error.name,
          httpStatus: error.status || HttpStatusCode.InternalServerError,
          endpoint: error.endpoint || url.toString(),
        },
      });
    }

    const originalErrorMessage =
      error instanceof Error ? error.message : "Network request failed";

    throw new ClientError(ERROR_CODES.CONNECTION_ERROR, originalErrorMessage, {
      metadata: {
        endpoint: url.toString(),
        originalErrorName:
          error instanceof Error ? error.name : "UnknownErrorType",
      },
      cause: error as Error,
    });
  }
};
