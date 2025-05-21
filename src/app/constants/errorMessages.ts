export const ClientErrorCategory = {
  CLIENT_VALIDATION: "CLIENT_VALIDATION",
  CLIENT_TRANSACTION: "CLIENT_TRANSACTION",
  CLIENT_UNKNOWN: "CLIENT_UNKNOWN",
  ORDINALS_ERROR: "ORDINALS_ERROR",
  RPC_NODE: "RPC_NODE_ERROR",
  COMPLIANCE: "COMPLIANCE_ERROR",
} as const;

export type ClientErrorCategory =
  (typeof ClientErrorCategory)[keyof typeof ClientErrorCategory];

// Client error messages mapping
const CLIENT_ERROR_MESSAGES: Record<ClientErrorCategory, string> = {
  CLIENT_VALIDATION:
    "The provided data is invalid. Please check your input and try again.",
  CLIENT_TRANSACTION: "Failed to process transaction. Please try again.",
  CLIENT_UNKNOWN: "An unexpected client error occurred.",
  ORDINALS_ERROR: "Operation failed due to the presence of ordinals.",
  RPC_NODE_ERROR:
    "Unable to connect to the RPC node. Network fee data couldn't be loaded.",
  COMPLIANCE_ERROR:
    "This operation cannot be completed due to compliance restrictions.",
} as const;

export function getClientErrorMessage(
  category: ClientErrorCategory,
  details?: string,
): string {
  const baseMessage =
    CLIENT_ERROR_MESSAGES[category] ?? CLIENT_ERROR_MESSAGES.CLIENT_UNKNOWN;
  return details ? `${baseMessage} Details: ${details}` : baseMessage;
}
