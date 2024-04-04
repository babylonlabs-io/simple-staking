import { getApiData } from "@/utils/getApiData";

interface FinalityProviders {
  data: FinalityProvider[];
}

export interface FinalityProvider {
  description: Description;
  commission: string;
  btc_pk: string;
  active_tvl: number;
  total_tvl: number;
  active_delegations: number;
  total_delegations: number;
}

interface Description {
  moniker: string;
  identity: string;
  website: string;
  security_contact: string;
  details: string;
}

export const getFinalityProviders = async (): Promise<FinalityProviders> =>
  getApiData("/v1/finality-providers", "Error getting finality providers");
