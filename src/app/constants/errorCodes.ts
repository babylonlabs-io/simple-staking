import { ValueOf } from "next/dist/shared/lib/constants";

import { HttpStatusCode } from "./httpStatusCodes";

// Client-side error codes
export const ClientErrorCodes = {
  CLIENT_GENERIC: "CLIENT_GENERIC",
  CLIENT_NETWORK: "CLIENT_NETWORK",
  CLIENT_VALIDATION: "CLIENT_VALIDATION",
  CLIENT_TRANSACTION: "CLIENT_TRANSACTION",
} as const;

export type ClientErrorCodeType = ValueOf<typeof ClientErrorCodes>;

// Client error messages mapping
const CLIENT_ERROR_MESSAGES: Record<ClientErrorCodeType, string> = {
  CLIENT_GENERIC: "An unexpected client-side error occurred.",
  CLIENT_NETWORK:
    "Unable to connect to the network. Please check your internet connection.",
  CLIENT_VALIDATION:
    "The provided data is invalid. Please check your input and try again.",
  CLIENT_TRANSACTION: "Failed to process transaction. Please try again.",
} as const;

/**
 * Get user-friendly message for client errors
 */
export function getClientErrorMessage(
  code: ClientErrorCodeType,
  details?: string,
): string {
  const baseMessage =
    CLIENT_ERROR_MESSAGES[code] || "An unexpected error occurred.";
  return details ? `${baseMessage} Details: ${details}` : baseMessage;
}

// Server-side error codes mapped from HTTP status codes
export const ServerErrorCodes = {
  SERVER_BAD_REQUEST: HttpStatusCode.BAD_REQUEST.toString(),
  SERVER_FORBIDDEN: HttpStatusCode.FORBIDDEN.toString(),
  SERVER_NOT_FOUND: HttpStatusCode.NOT_FOUND.toString(),
  SERVER_INTERNAL_ERROR: HttpStatusCode.INTERNAL_SERVER_ERROR.toString(),
  SERVER_BAD_GATEWAY: HttpStatusCode.BAD_GATEWAY.toString(),
  SERVER_SERVICE_UNAVAILABLE: HttpStatusCode.SERVICE_UNAVAILABLE.toString(),
  SERVER_TIMEOUT: HttpStatusCode.REQUEST_TIMEOUT.toString(),
  SERVER_TOO_MANY_REQUESTS: HttpStatusCode.TOO_MANY_REQUESTS.toString(),
  SERVER_UNPROCESSABLE_ENTITY: HttpStatusCode.UNPROCESSABLE_ENTITY.toString(),
} as const;
// Combined error codes
export const ErrorCodes = {
  ...ClientErrorCodes,
  ...ServerErrorCodes,
  UNKNOWN: "UNKNOWN_ERROR",
} as const;

export type ErrorCodeType = ValueOf<typeof ErrorCodes>;

const STATUS_TO_ERROR_CODE: Record<number, ErrorCodeType> = {
  [HttpStatusCode.BAD_REQUEST]: ServerErrorCodes.SERVER_BAD_REQUEST,
  [HttpStatusCode.FORBIDDEN]: ServerErrorCodes.SERVER_FORBIDDEN,
  [HttpStatusCode.NOT_FOUND]: ServerErrorCodes.SERVER_NOT_FOUND,
  [HttpStatusCode.INTERNAL_SERVER_ERROR]:
    ServerErrorCodes.SERVER_INTERNAL_ERROR,
  [HttpStatusCode.BAD_GATEWAY]: ServerErrorCodes.SERVER_BAD_GATEWAY,
  [HttpStatusCode.SERVICE_UNAVAILABLE]:
    ServerErrorCodes.SERVER_SERVICE_UNAVAILABLE,
};

/**
 * Maps HTTP status codes to error codes
 */
export function getErrorCodeFromStatus(status: number): ErrorCodeType {
  return STATUS_TO_ERROR_CODE[status] ?? ErrorCodes.UNKNOWN;
}
