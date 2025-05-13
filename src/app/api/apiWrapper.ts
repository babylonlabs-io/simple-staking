import qs from "qs";

import { ClientError, ERROR_CODES } from "@/errors";

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
    ? `?${qs.stringify(params.query, { arrayFormat: "repeat" })}`
    : "";

  const url = `${process.env.NEXT_PUBLIC_API_URL}${path}${queryString}`;

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

  const requestData = {
    method,
    url,
    path,
    queryParams: params?.query,
    body: params?.body,
    timeout,
  };

  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      const responseText = await response
        .text()
        .catch(() => generalErrorMessage);

      const clientError = new ClientError(
        ERROR_CODES.EXTERNAL_SERVICE_UNAVAILABLE,
        generalErrorMessage,
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
