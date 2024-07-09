import axios from "axios";

export const apiWrapper = async (
  method: "GET" | "POST",
  url: string,
  generalErrorMessage: string,
  params?: any,
) => {
  let response;
  let handler;
  switch (method) {
    case "GET":
      handler = axios.get;
      break;
    case "POST":
      handler = axios.post;
      break;
    default:
      throw new Error("Invalid method");
  }

  const isTestnet = new URLSearchParams(window.location.search).has("testnet");
  const baseURL = isTestnet
    ? process.env.NEXT_PUBLIC_API_URL_TESTNET
    : process.env.NEXT_PUBLIC_API_URL;
  const fullURL = `${baseURL}${url}`;

  try {
    response = await handler(
      fullURL,
      method === "POST"
        ? { ...params }
        : {
            params,
          },
    );
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message = error?.response?.data?.message;
      throw new Error(message || generalErrorMessage);
    } else {
      throw new Error(generalErrorMessage);
    }
  }
  return response;
};
