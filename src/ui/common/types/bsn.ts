export type BsnType = "COSMOS" | "ROLLUP";

export interface Bsn {
  id: string;
  name: string;
  description: string;
  logoUrl: string;
  activeTvl?: number;
  type: BsnType;
  allowlist?: string[]; // BTC FP pubkeys (hex)
}
