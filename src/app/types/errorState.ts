export enum ErrorState {
  GET_STAKING = "GET_STAKING",
  GET_DELEGATION = "GET_DELEGATION",
  GET_FINALITY_PROVIDER = "GET_FINALITY_PROVIDER",
  GET_GLOBAL_PARAMS = "GET_GLOBAL_PARAMS",
  GET_STATS = "GET_STATS",
  GET_UNBOUNDING_ELIGIBILITY = "GET_UNBOUNDING_ELIGIBILITY",
  POST_UNBOUNDING = "POST_UNBOUNDING",
  SWITCH_NETWORK = "SWITCH_NETWORK",
  WITHDRAW = "WITHDRAW",
}

export interface ErrorType {
  message: string;
  errorCode?: string;
  errorState?: ErrorState;
  errorTime: Date;
  metadata?: ErrorMetadata;
}

export interface ErrorMetadata {
  btcAmount?: number;
  network?: string;
}
