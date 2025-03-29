import { HttpStatusCode } from "@/app/api/httpStatusCodes";
import { ServerError } from "@/app/context/Error/errors";

type FetchOptions = {
  method?: Request["method"];
  body?: BodyInit;
  headers?: HeadersInit;
  parseAs?: "json" | "text";
  formatErrorResponse?: (errorText: string) => string;
};

/**
 * Validates a URL path component to prevent path traversal attacks
 * @param path - The path component to validate
 * @returns The validated path component
 * @throws ServerError if the path contains potentially malicious sequences
 */
export const validateUrlPath = (path: string): string => {
  const pathTraversalPatterns = [
    /\.\./, // Double dot
    /\.\/|\/\./, // Current directory references
    /\/|\\/, // Forward and back slashes
    /%2e%2e/i, // URL encoded '..'
    /%2e\//i,
    /\/%2e/i, // URL encoded './'
    /%2f/i,
    /%5c/i, // URL encoded '/' and '\'
  ];

  if (pathTraversalPatterns.some((pattern) => pattern.test(path))) {
    throw new ServerError({
      message: "Invalid parameter: potential path traversal detected",
      status: HttpStatusCode.BadRequest,
      endpoint: "validateUrlPath",
    });
  }

  return path;
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
      throw new ServerError({
        message,
        status: response.status,
        endpoint: url.toString(),
      });
    }

    const data =
      parseAs === "text" ? await response.text() : await response.json();

    return data as T;
  } catch (error) {
    if (error instanceof ServerError) throw error;

    const message =
      error instanceof Error ? error.message : "Network request failed";

    throw new ServerError({
      message,
      status: HttpStatusCode.InternalServerError,
      endpoint: url.toString(),
    });
  }
};
