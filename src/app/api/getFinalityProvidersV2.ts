import { isValidUrl } from "@/utils/url";

import { Pagination } from "../types/api";
import {
  FinalityProviderState,
  FinalityProviderV2,
} from "../types/finalityProvidersV2";

import { apiWrapper } from "./apiWrapper";

export interface PaginatedFinalityProviders {
  finalityProviders: FinalityProviderV2[];
  pagination: Pagination;
}

interface FinalityProvidersAPIResponse {
  data: FinalityProviderAPI[];
  pagination: Pagination;
}

interface FinalityProviderAPI {
  description: DescriptionAPI;
  state: FinalityProviderState;
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

export const getFinalityProvidersV2 = async ({
  key,
  pk,
  sortBy,
  order,
  name,
}: {
  key: string;
  name?: string;
  sortBy?: string;
  order?: "asc" | "desc";
  pk?: string;
}): Promise<PaginatedFinalityProviders> => {
  const params = {
    pagination_key: key,
    finality_provider_pk: pk,
    sort_by: sortBy,
    order,
    name,
  };

  const response = await apiWrapper(
    "GET",
    "/v2/finality-providers",
    "Error getting finality providers",
    { query: params },
  );

  const finalityProvidersAPIResponse: FinalityProvidersAPIResponse =
    response.data;
  const finalityProvidersAPI: FinalityProviderAPI[] =
    finalityProvidersAPIResponse.data;

  const finalityProviders = finalityProvidersAPI.map(
    (fp: FinalityProviderAPI): FinalityProviderV2 => ({
      description: {
        moniker: fp.description.moniker,
        identity: fp.description.identity,
        website: isValidUrl(fp.description.website)
          ? fp.description.website
          : "",
        securityContact: fp.description.security_contact,
        details: fp.description.details,
      },
      state: fp.state,
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
