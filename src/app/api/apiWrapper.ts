import axios from "axios";

export const apiWrapper = async (
  method: "GET" | "POST",
  url: string,
  generalErrorMessage: string,
  params?: any,
) => {
  let response;
  try {
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

    response = await handler(`${process.env.NEXT_PUBLIC_API_URL}${url}`, {
      params,
    });
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
