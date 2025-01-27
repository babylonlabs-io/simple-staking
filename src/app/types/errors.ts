export enum ErrorState {
  // Server-related errors
  SERVER_ERROR = "SERVER_ERROR",

  // Staking lifecycle errors
  STAKING = "STAKING",
  UNBONDING = "UNBONDING",
  WITHDRAW = "WITHDRAW",
  TRANSITION = "TRANSITION",
  SLASHING = "SLASHING",

  // Wallet/network errors
  WALLET = "WALLET",
  NETWORK = "NETWORK",

  // Data errors
  DELEGATIONS = "DELEGATIONS",
  VALIDATION = "VALIDATION",

  // Fallback
  UNKNOWN = "UNKNOWN",
}

export interface Error {
  message: string;
  errorState?: ErrorState;
  displayMessage?: string;
  // Only for server errors
  endpoint?: string;
}

export interface ErrorDisplayOptions {
  errorState: ErrorState;
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
