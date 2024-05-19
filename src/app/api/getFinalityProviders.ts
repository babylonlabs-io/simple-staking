import { apiWrapper } from "./apiWrapper";

import { FinalityProvider, Description } from "../types/finalityProviders";

interface FinalityProvidersAPIResponse {
  data: FinalityProviderAPI[];
}

interface FinalityProviderAPI {
  description: DescriptionAPI;
  commission: string;
  btc_pk: string;
  active_tvl: number;
  total_tvl: number;
  active_delegations: number;
  total_delegations: number;
}

interface DescriptionAPI {
  moniker: string;
  identity: string;
  website: string;
  security_contact: string;
  details: string;
}

// TODO: implement pagination
export const getFinalityProviders = async (): Promise<FinalityProvider[]> => {
  const response = await apiWrapper(
    "GET",
    "/v1/finality-providers",
    "Error getting finality providers",
  );

  const finalityProvidersAPIResponse: FinalityProvidersAPIResponse =
    response.data;
  const finalityProvidersAPI: FinalityProviderAPI[] =
    finalityProvidersAPIResponse.data;

  const finalityProviders = finalityProvidersAPI.map(
    (fp: FinalityProviderAPI): FinalityProvider => ({
      description: {
        moniker: fp.description.moniker,
        identity: fp.description.identity,
        website: fp.description.website,
        securityContact: fp.description.security_contact,
        details: fp.description.details,
      },
      commission: fp.commission,
      btcPk: fp.btc_pk,
      activeTVLSat: fp.active_tvl,
      totalTVLSat: fp.total_tvl,
      activeDelegations: fp.active_delegations,
      totalDelegations: fp.total_delegations,
    }),
  );

  return finalityProviders;
};
