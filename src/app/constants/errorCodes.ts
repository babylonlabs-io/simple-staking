import { HttpStatusCode } from "./httpStatusCodes";

export const ClientErrorCodes = {
  GENERIC: "CLIENT_GENERIC",
  NETWORK: "CLIENT_NETWORK",
  VALIDATION: "CLIENT_VALIDATION",
  TRANSACTION: "CLIENT_TRANSACTION",
} as const;

export const CLIENT_ERROR_MESSAGES: Record<string, string> = {
  [ClientErrorCodes.GENERIC]: "An unexpected client-side error occurred.",
  [ClientErrorCodes.NETWORK]:
    "Unable to connect to the network. Please check your internet connection.",
  [ClientErrorCodes.VALIDATION]:
    "The provided data is invalid. Please check your input and try again.",
  [ClientErrorCodes.TRANSACTION]:
    "Failed to process transaction. Please try again.",
} as const;

export type ClientErrorCodeType =
  (typeof ClientErrorCodes)[keyof typeof ClientErrorCodes];

export function getClientErrorMessage(
  code: ClientErrorCodeType,
  details?: string,
): string {
  const baseMessage =
    CLIENT_ERROR_MESSAGES[code] || "An unexpected error occurred.";
  return details ? `${baseMessage} Details: ${details}` : baseMessage;
}

export const ErrorCodes = {
  // Client-side Errors
  CLIENT_GENERIC: "CLIENT_GENERIC",
  CLIENT_NETWORK: "CLIENT_NETWORK",
  CLIENT_VALIDATION: "CLIENT_VALIDATION",
  CLIENT_TRANSACTION: "CLIENT_TRANSACTION",

  // Server-side Errors
  SERVER_BAD_REQUEST: HttpStatusCode.BAD_REQUEST.toString(),
  SERVER_FORBIDDEN: HttpStatusCode.FORBIDDEN.toString(),
  SERVER_NOT_FOUND: HttpStatusCode.NOT_FOUND.toString(),
  SERVER_INTERNAL_ERROR: HttpStatusCode.INTERNAL_SERVER_ERROR.toString(),
  SERVER_BAD_GATEWAY: HttpStatusCode.BAD_GATEWAY.toString(),
  SERVER_SERVICE_UNAVAILABLE: HttpStatusCode.SERVICE_UNAVAILABLE.toString(),

  // API-specific Errors
  API_RATE_LIMIT: HttpStatusCode.TOO_MANY_REQUESTS.toString(),
  API_VALIDATION: HttpStatusCode.UNPROCESSABLE_ENTITY.toString(),

  // Fallback
  UNKNOWN_ERROR: "UNKNOWN_ERROR",
  SERVER_TIMEOUT: "SERVER_TIMEOUT",
} as const;

export type ErrorCodeType = (typeof ErrorCodes)[keyof typeof ErrorCodes];

// Helper function to get ErrorCode from HTTP status
export function getErrorCodeFromStatus(status: number): ErrorCodeType {
  switch (status) {
    case HttpStatusCode.BAD_REQUEST:
      return ErrorCodes.SERVER_BAD_REQUEST;
    case HttpStatusCode.FORBIDDEN:
      return ErrorCodes.SERVER_FORBIDDEN;
    case HttpStatusCode.NOT_FOUND:
      return ErrorCodes.SERVER_NOT_FOUND;
    case HttpStatusCode.TOO_MANY_REQUESTS:
      return ErrorCodes.API_RATE_LIMIT;
    case HttpStatusCode.UNPROCESSABLE_ENTITY:
      return ErrorCodes.API_VALIDATION;
    case HttpStatusCode.INTERNAL_SERVER_ERROR:
      return ErrorCodes.SERVER_INTERNAL_ERROR;
    case HttpStatusCode.BAD_GATEWAY:
      return ErrorCodes.SERVER_BAD_GATEWAY;
    case HttpStatusCode.SERVICE_UNAVAILABLE:
      return ErrorCodes.SERVER_SERVICE_UNAVAILABLE;
    default:
      return ErrorCodes.UNKNOWN_ERROR;
  }
}
