export enum HttpStatusCode {
  // 2xx Success
  OK = 200,
  CREATED = 201,
  ACCEPTED = 202,
  NO_CONTENT = 204,

  // 4xx Client Errors
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  METHOD_NOT_ALLOWED = 405,
  CONFLICT = 409,
  PAYLOAD_TOO_LARGE = 413,
  UNSUPPORTED_MEDIA_TYPE = 415,
  TOO_MANY_REQUESTS = 429,
  UNPROCESSABLE_ENTITY = 422,

  // 5xx Server Errors
  INTERNAL_SERVER_ERROR = 500,
  NOT_IMPLEMENTED = 501,
  BAD_GATEWAY = 502,
  SERVICE_UNAVAILABLE = 503,
  GATEWAY_TIMEOUT = 504,
}

// Map HTTP status codes to user-friendly messages
export const HTTP_ERROR_MESSAGES: Record<number, string> = {
  [HttpStatusCode.BAD_REQUEST]:
    "The request was invalid or cannot be served. Please check your input.",
  [HttpStatusCode.UNAUTHORIZED]:
    "Authentication is required. Please log in and try again.",
  [HttpStatusCode.FORBIDDEN]:
    "You don't have permission to access this resource.",
  [HttpStatusCode.NOT_FOUND]: "The requested resource could not be found.",
  [HttpStatusCode.METHOD_NOT_ALLOWED]: "The requested method is not allowed.",
  [HttpStatusCode.TOO_MANY_REQUESTS]:
    "Too many requests. Please wait a moment before trying again.",
  [HttpStatusCode.UNPROCESSABLE_ENTITY]:
    "The server could not process your request. Please check your input.",

  [HttpStatusCode.INTERNAL_SERVER_ERROR]:
    "An unexpected server error occurred. Our team has been notified.",
  [HttpStatusCode.BAD_GATEWAY]:
    "The server received an invalid response. Please try again later.",
  [HttpStatusCode.SERVICE_UNAVAILABLE]:
    "The service is temporarily unavailable. Please try again later.",
  [HttpStatusCode.GATEWAY_TIMEOUT]:
    "The server took too long to respond. Please try again.",
} as const;

export function getHttpErrorMessage(
  status: number,
  fallbackMessage?: string,
): string {
  return (
    HTTP_ERROR_MESSAGES[status] ||
    fallbackMessage ||
    "An unknown error occurred. Please try again later."
  );
}
