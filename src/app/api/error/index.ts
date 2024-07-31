import { isAxiosError } from "axios";

export const isAxiosError451 = (error: any): boolean => {
  return (
    isAxiosError(error) &&
    (error.response?.status === 451 || error.request.status === 451)
  );
};
