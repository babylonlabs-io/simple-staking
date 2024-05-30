import { encode } from "url-safe-base64";

import { Pagination } from "../types/api";
import { FinalityProvider } from "../types/finalityProviders";

import { apiWrapper } from "./apiWrapper";

export interface PaginatedFinalityProviders {
  finalityProviders: FinalityProvider[];
  pagination: Pagination;
}

interface FinalityProvidersAPIResponse {
  data: FinalityProviderAPI[];
  pagination: Pagination;
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

export const getFinalityProviders = async (
  key: string,
): Promise<PaginatedFinalityProviders> => {
  // const limit = 100;
  // const reverse = false;

  const params = {
    pagination_key: encode(key),
    // "pagination_reverse": reverse,
    // "pagination_limit": limit,
  };

  const response = await apiWrapper(
    "GET",
    "/v1/finality-providers",
    "Error getting finality providers",
    params,
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

  const pagination: Pagination = {
    next_key: finalityProvidersAPIResponse.pagination.next_key,
  };

  return { finalityProviders, pagination };
};
