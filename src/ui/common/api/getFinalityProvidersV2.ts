import { getBsnLogoUrl } from "@/ui/common/utils/bsnLogo";
import { isValidUrl } from "@/ui/common/utils/url";

import { Pagination } from "../types/api";
import {
  FinalityProvider,
  FinalityProviderState,
} from "../types/finalityProviders";

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
  state: FinalityProviderState;
  commission: string;
  btc_pk: string;
  active_tvl: number;
  total_tvl: number;
  active_delegations: number;
  total_delegations: number;
  logo_url?: string;
  bsn_id?: string;
  type: string;
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
  bsnId,
}: {
  key: string;
  name?: string;
  sortBy?: string;
  order?: "asc" | "desc";
  pk?: string;
  bsnId?: string;
}): Promise<PaginatedFinalityProviders> => {
  const params = {
    pagination_key: key,
    finality_provider_pk: pk,
    sort_by: sortBy,
    order,
    name,
    ...(bsnId ? { bsn_id: bsnId } : {}),
  };

  const response = await apiWrapper<FinalityProvidersAPIResponse>(
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
    (fp: FinalityProviderAPI, i): FinalityProvider => ({
      description: {
        moniker: fp.description.moniker,
        identity: fp.description.identity,
        website: isValidUrl(fp.description.website)
          ? fp.description.website
          : "",
        securityContact: fp.description.security_contact,
        details: fp.description.details,
      },
      id: fp.btc_pk,
      rank: i + 1,
      state: fp.state,
      commission: fp.commission,
      btcPk: fp.btc_pk,
      activeTVLSat: fp.active_tvl,
      totalTVLSat: fp.total_tvl,
      activeDelegations: fp.active_delegations,
      totalDelegations: fp.total_delegations,
      logo_url: fp.logo_url,
      bsnId: fp.bsn_id,
      bsnLogoUrl: getBsnLogoUrl(fp.bsn_id),
      chain: fp.type,
    }),
  );

  const pagination: Pagination = {
    next_key: finalityProvidersAPIResponse.pagination.next_key,
  };

  return { finalityProviders, pagination };
};
