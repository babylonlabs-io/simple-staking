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

export type FinalityProviderState = keyof typeof stateMap;

const stateMap = {
  FINALITY_PROVIDER_STATUS_INACTIVE: "Inactive",
  FINALITY_PROVIDER_STATUS_ACTIVE: "Active",
  FINALITY_PROVIDER_STATUS_JAILED: "Jailed",
  FINALITY_PROVIDER_STATUS_SLASHED: "Slashed",
};

export const mapFinalityProviderState = (
  state: FinalityProviderState,
): string => {
  return stateMap[state];
};
