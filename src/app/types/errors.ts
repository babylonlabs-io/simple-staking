export enum ErrorType {
  // Server-related errors
  SERVER = "SERVER",

  // Staking lifecycle errors
  STAKING = "STAKING",
  UNBONDING = "UNBONDING",
  WITHDRAW = "WITHDRAW",
  REGISTRATION = "REGISTRATION",

  // Wallet errors
  WALLET = "WALLET",

  // Data errors
  DELEGATIONS = "DELEGATIONS",

  // Fallback
  UNKNOWN = "UNKNOWN",
}

export interface Error {
  message: string;
  type?: ErrorType;
  displayMessage?: string;
}

export interface ErrorDisplayOptions {
  errorType: ErrorType;
  retryAction?: () => void;
  noCancel?: boolean;
}

export interface ErrorHandlerParam {
  error: Error | null;
  displayError: ErrorDisplayOptions;
}

export interface ShowErrorParams {
  error: Error;
  retryAction?: () => void;
  noCancel?: boolean;
}
