export enum ErrorState {
  SERVER_ERROR = "SERVER_ERROR",
  UNBONDING = "UNBONDING",
  WALLET = "WALLET",
  WITHDRAW = "WITHDRAW",
  STAKING = "STAKING",
}

export interface ErrorType {
  message: string;
  errorState?: ErrorState;
  errorTime: Date;
}

export interface ErrorHandlerParam {
  error: Error | null;
  hasError: boolean;
  errorState: ErrorState;
  refetchFunction: () => void;
}

export interface ShowErrorParams {
  error: ErrorType;
  retryAction?: () => void;
}
