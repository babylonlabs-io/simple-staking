export type HealthCheckResult =
  | { status: HealthCheckStatus.Normal; message: string }
  | { status: HealthCheckStatus.GeoBlocked; message: string }
  | { status: HealthCheckStatus.Error; message: string };

export enum HealthCheckStatus {
  Normal = "normal",
  GeoBlocked = "geoblocked",
  Error = "error",
}

export const API_ERROR_MESSAGE =
  "Error occurred while fetching API. Please try again later";
export const GEO_BLOCK_MESSAGE =
  "The Bitcoin Staking functionality is not available in your region";
