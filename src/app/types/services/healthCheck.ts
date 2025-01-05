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
  "We're sorry, but this page isn't accessible in your location at the moment due to the regional restrictions";
