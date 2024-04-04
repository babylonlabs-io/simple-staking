import axios from "axios";

export const getApiData = async (
  url: string,
  generalErrorMessage: string,
  params?: any,
) => {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}${url}`,
      { params },
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message = error?.response?.data?.message;
      throw new Error(generalErrorMessage, message);
    } else {
      throw new Error(generalErrorMessage);
    }
  }
};
