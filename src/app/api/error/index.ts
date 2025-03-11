/**
 * Checks if an error is a 451 HTTP status code error (Unavailable For Legal Reasons)
 * @param error - The error to check
 * @returns boolean indicating if the error has a 451 status code
 */
export const isError451 = (error: any): boolean => {
  return (
    error &&
    (error.status === 451 ||
      (error.response && error.response.status === 451) ||
      (error.request && error.request.status === 451))
  );
};
