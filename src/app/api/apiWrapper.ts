import axios from "axios";

export const apiWrapper = async (
  method: "GET" | "POST",
  path: string,
  generalErrorMessage: string,
  params?: any,
  timeout?: number,
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

  try {
    // destructure params in case of post request
    response = await handler(
      `${process.env.NEXT_PUBLIC_API_URL}${path}`,
      method === "POST"
        ? { ...params }
        : {
            params,
          },
      {
        timeout: timeout || 0, // 0 is no timeout
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
