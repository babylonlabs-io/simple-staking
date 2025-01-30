import { ValueOf } from "next/dist/shared/lib/constants";

export const ClientErrorCategory = {
  CLIENT_VALIDATION: "CLIENT_VALIDATION",
  CLIENT_TRANSACTION: "CLIENT_TRANSACTION",
  CLIENT_UNKNOWN: "CLIENT_UNKNOWN",
} as const;

export type ClientErrorCategory = ValueOf<typeof ClientErrorCategory>;

// Client error messages mapping
const CLIENT_ERROR_MESSAGES: Record<ClientErrorCategory, string> = {
  CLIENT_VALIDATION:
    "The provided data is invalid. Please check your input and try again.",
  CLIENT_TRANSACTION: "Failed to process transaction. Please try again.",
  CLIENT_UNKNOWN: "An unexpected client error occurred.",
} as const;

export function getClientErrorMessage(
  category: ClientErrorCategory,
  details?: string,
): string {
  const baseMessage =
    CLIENT_ERROR_MESSAGES[category] ?? CLIENT_ERROR_MESSAGES.CLIENT_UNKNOWN;
  return details ? `${baseMessage} Details: ${details}` : baseMessage;
}
