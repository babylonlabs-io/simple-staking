import { Dispatch, SetStateAction } from "react";

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
  finalityProviders: FinalityProvider[] | undefined;
  setFinalityProviders: Dispatch<
    SetStateAction<FinalityProvider[] | undefined>
  >;
  selectedFinalityProvider: FinalityProvider | undefined;
  onFinalityProviderChange: (btcPkHex: string) => void;
}

export type SortField = "moniker" | "btcPk" | "stakeSat" | "commission";
export type SortDirection = "asc" | "desc";

export interface FinalityProvidersSortButtonProps {
  field: SortField;
  label: string;
  onSort: (field: SortField) => void;
}
