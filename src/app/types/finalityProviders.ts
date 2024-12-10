export interface FinalityProvider {
  description: Description;
  state: FinalityProviderState;
  commission: string;
  btcPk: string;
  activeTVLSat: number;
  totalTVLSat: number;
  activeDelegations: number;
  totalDelegations: number;
}

export interface Description {
  moniker: string;
  identity: string;
  website: string;
  securityContact: string;
  details: string;
}

export enum FinalityProviderStatus {
  FINALITY_PROVIDER_STATUS_ACTIVE = "Active",
  FINALITY_PROVIDER_STATUS_INACTIVE = "Inactive",
  FINALITY_PROVIDER_STATUS_JAILED = "Jailed",
  FINALITY_PROVIDER_STATUS_SLASHED = "Slashed",
}

export type FinalityProviderState =
  | "FINALITY_PROVIDER_STATUS_ACTIVE"
  | "FINALITY_PROVIDER_STATUS_INACTIVE"
  | "FINALITY_PROVIDER_STATUS_JAILED"
  | "FINALITY_PROVIDER_STATUS_SLASHED";
