export type HealthCheckResult =
  | { status: "normal"; message: string }
  | { status: "geoBlocked"; message: string }
  | { status: "error"; message: string };
