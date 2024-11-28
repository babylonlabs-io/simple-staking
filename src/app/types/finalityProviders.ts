export interface FinalityProvider {
  description: Description;
  commission: string;
  btcPk: string;
  activeTVLSat: number;
  totalTVLSat: number;
  activeDelegations: number;
  totalDelegations: number;
}

export interface FinalityProviderV2 {
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

export type FinalityProviderState =
  | "FINALITY_PROVIDER_STATUS_INACTIVE"
  | "FINALITY_PROVIDER_STATUS_ACTIVE"
  | "FINALITY_PROVIDER_STATUS_JAILED"
  | "FINALITY_PROVIDER_STATUS_SLASHED";
