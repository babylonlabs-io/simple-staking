import { stringify } from "qs";

import { ClientError, ERROR_CODES } from "@/ui/common/errors";

import { getApiBaseUrl } from "../config";

type QueryParamValue =
  | string
  | number
  | boolean
  | Array<string | number | boolean>;

interface QueryParams {
  [key: string]: QueryParamValue | undefined;
}

interface RequestParams {
  query?: QueryParams;
  body?: any;
}

export const apiWrapper = async <TResponseData = unknown>(
  method: "GET" | "POST",
  path: string,
  generalErrorMessage: string,
  params?: RequestParams,
  timeout?: number,
): Promise<{
  data: TResponseData;
  status: number;
}> => {
  const queryString = params?.query
    ? `?${stringify(params.query, { arrayFormat: "repeat" })}`
    : "";

  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}${path}${queryString}`;

  const options: RequestInit = {
    method,
    headers:
      method === "POST"
        ? {
            "Content-Type": "application/json",
          }
        : {},
  };

  if (params?.body) {
    options.body = JSON.stringify(params.body);
  }

  if (timeout) {
    options.signal = AbortSignal.timeout(timeout);
  }

  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      const responseText = await response
        .text()
        .catch(() => generalErrorMessage);
      const cause = new Error(responseText);
      (cause as any).status = response.status;
      const clientError = new ClientError(
        ERROR_CODES.EXTERNAL_SERVICE_UNAVAILABLE,
        "Error fetching data from the API",
        {
          cause,
        },
      );
      throw clientError;
    }

    const data = await response.json();
    return { data, status: response.status };
  } catch (error) {
    if (error instanceof ClientError) {
      throw error;
    }

    if (error instanceof TypeError && error.message.includes("NetworkError")) {
      const clientError = new ClientError(
        ERROR_CODES.CONNECTION_ERROR,
        "Network error occurred",
        {
          cause: error,
        },
      );
      throw clientError;
    }

    const clientError = new ClientError(
      ERROR_CODES.EXTERNAL_SERVICE_UNAVAILABLE,
      error instanceof Error ? error.message : generalErrorMessage,
      {
        cause: error as Error,
      },
    );
    throw clientError;
  }
};
