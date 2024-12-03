export interface FinalityProvider {
  description: Description;
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

export interface FinalityProvidersProps {
  onFinalityProvidersLoad: (finalityProviders: FinalityProvider[]) => void;
  selectedFinalityProvider: FinalityProvider | undefined;
  onFinalityProviderChange: (btcPkHex: string) => void;
}
