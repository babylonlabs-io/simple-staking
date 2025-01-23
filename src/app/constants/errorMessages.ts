import { ErrorCodes, ErrorCodeType } from "./errorCodes";

export const ERROR_MESSAGES: Record<ErrorCodeType, string> = {
  // Client-side error messages
  [ErrorCodes.CLIENT_GENERIC]: "An unexpected client-side error occurred.",
  [ErrorCodes.CLIENT_NETWORK]:
    "Unable to connect to the network. Please check your internet connection.",
  [ErrorCodes.CLIENT_VALIDATION]:
    "The provided data is invalid. Please check your input and try again.",
  [ErrorCodes.CLIENT_TRANSACTION]:
    "Failed to process transaction. Please try again.",

  // Server-side error messages
  [ErrorCodes.SERVER_BAD_REQUEST]:
    "The request was invalid or cannot be served. Please check your input.",
  [ErrorCodes.SERVER_FORBIDDEN]:
    "You don't have permission to access this resource.",
  [ErrorCodes.SERVER_NOT_FOUND]: "The requested resource could not be found.",
  [ErrorCodes.SERVER_TIMEOUT]:
    "The server took too long to respond. Please try again.",
  [ErrorCodes.SERVER_INTERNAL_ERROR]:
    "An unexpected server error occurred. Our team has been notified.",
  [ErrorCodes.SERVER_BAD_GATEWAY]:
    "The server received an invalid response. Please try again later.",
  [ErrorCodes.SERVER_SERVICE_UNAVAILABLE]:
    "The service is temporarily unavailable. Please try again later.",

  // API-specific error messages
  [ErrorCodes.API_RATE_LIMIT]:
    "Too many requests. Please wait a moment before trying again.",
  [ErrorCodes.API_VALIDATION]:
    "The server could not process your request. Please check your input.",

  // Fallback error message
  [ErrorCodes.UNKNOWN_ERROR]:
    "An unknown error occurred. Please try again later.",
};

export function getErrorMessage(code: ErrorCodeType, details?: string): string {
  const baseMessage =
    ERROR_MESSAGES[code] || ERROR_MESSAGES[ErrorCodes.UNKNOWN_ERROR];
  return details ? `${baseMessage} Details: ${details}` : baseMessage;
}
