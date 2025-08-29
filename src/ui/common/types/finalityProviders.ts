export interface FinalityProvider {
  id: string;
  rank: number;
  description: Description;
  state: FinalityProviderState;
  commission: string;
  btcPk: string;
  activeTVLSat: number;
  totalTVLSat: number;
  activeDelegations: number;
  totalDelegations: number;
  logo_url?: string;
  bsnId?: string;
  bsnLogoUrl?: string;
  chain: string;
}

export interface FinalityProviderV1 {
  description: Description;
  state: "active" | "standby";
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

export enum FinalityProviderState {
  ACTIVE = "FINALITY_PROVIDER_STATUS_ACTIVE",
  INACTIVE = "FINALITY_PROVIDER_STATUS_INACTIVE",
  JAILED = "FINALITY_PROVIDER_STATUS_JAILED",
  SLASHED = "FINALITY_PROVIDER_STATUS_SLASHED",
}

export const FinalityProviderStateLabels: Record<
  FinalityProviderState,
  string
> = {
  [FinalityProviderState.ACTIVE]: "Active",
  [FinalityProviderState.INACTIVE]: "Inactive",
  [FinalityProviderState.JAILED]: "Jailed",
  [FinalityProviderState.SLASHED]: "Slashed",
};
