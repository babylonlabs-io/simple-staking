import { HttpStatusCode } from "axios";

import { ServerError } from "@/app/context/Error/errors";

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
