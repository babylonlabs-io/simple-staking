/**
 * @deprecated This enum is deprecated and will be removed in a future version.
 */
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

/**
 * @deprecated This interface is deprecated and will be removed in a future version.
 */
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
  category?: string;
  endpoint?: string;
  request?: Record<string, any>;
  response?: Record<string, any>;
  errorSource?: string;
  metadata?: Record<string, any>;
}

/**
 * @deprecated This interface is deprecated and will be removed in a future version.
 */
export interface ErrorHandlerParam {
  error: Error | null;
  metadata?: Record<string, unknown>;
  displayOptions?: {
    retryAction?: () => void;
    noCancel?: boolean;
    showModal?: boolean;
  };
}

export interface ShowErrorParams {
  error: Error;
  retryAction?: () => void;
  noCancel?: boolean;
  showModal?: boolean;
}
