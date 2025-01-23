import axios, { AxiosRequestConfig } from "axios";
import qs from "qs";

import { getErrorCodeFromStatus } from "../constants/errorCodes";
import { getErrorMessage } from "../constants/errorMessages";
import { ServerError } from "../context/Error/errors/serverError";

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

export const apiWrapper = async (
  method: "GET" | "POST",
  path: string,
  generalErrorMessage: string,
  params?: RequestParams,
  timeout?: number,
) => {
  const axiosConfig: AxiosRequestConfig = {
    timeout: timeout || 0,
    params: params?.query,
    paramsSerializer: (params) =>
      qs.stringify(params, { arrayFormat: "repeat" }),
  };

  const url = `${process.env.NEXT_PUBLIC_API_URL}${path}`;

  try {
    if (method === "GET") {
      return await axios.get(url, axiosConfig);
    } else {
      return await axios.post(url, params?.body, axiosConfig);
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status || 500;
      const errorCode = getErrorCodeFromStatus(status);
      const errorMessage = getErrorMessage(
        errorCode,
        error.response?.data?.message,
      );

      throw new ServerError(errorMessage, path);
    }
    throw new ServerError(generalErrorMessage, path);
  }
};
