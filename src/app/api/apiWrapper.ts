import qs from "qs";

import { ServerError } from "../context/Error/errors/serverError";

import { HttpStatusCode } from "./httpStatusCodes";

type QueryParamValue =
  | string
  | number
  | boolean
  | Array<string | number | boolean>;
type QueryParams = Record<string, QueryParamValue | undefined>;

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
    headers: {
      "Content-Type": "application/json",
    },
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
      throw new ServerError({
        message: await response.text().catch(() => generalErrorMessage),
        status: response.status,
        endpoint: path,
      });
    }

    const data = await response.json();
    return { data, status: response.status };
  } catch (error) {
    if (error instanceof ServerError) {
      throw error;
    }

    if (error instanceof TypeError && error.message.includes("NetworkError")) {
      throw new ServerError({
        message: "Network error occurred",
        status: HttpStatusCode.ServiceUnavailable,
        endpoint: path,
      });
    }

    throw new ServerError({
      message: generalErrorMessage,
      status: HttpStatusCode.InternalServerError,
      endpoint: path,
    });
  }
};
