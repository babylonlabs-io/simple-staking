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
  sentryEventId?: string;
  trace?: string;
  userPublicKey?: string;
  babylonAddress?: string;
  stakingTxHash?: string;
  btcAddress?: string;
}

export interface ErrorDisplayOptions {
  retryAction?: () => void;
  noCancel?: boolean;
}

export interface ErrorHandlerParam {
  error: Error | null;
  displayOptions?: ErrorDisplayOptions;
  metadata?: Record<string, string>;
}

export interface ShowErrorParams {
  error: Error;
  retryAction?: () => void;
  noCancel?: boolean;
}
