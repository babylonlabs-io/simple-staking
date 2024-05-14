import { encode } from "url-safe-base64";
import { apiWrapper } from "./apiWrapper";

interface FinalityProviders {
  data: FinalityProvider[];
  pagination: Pagination;
}

interface Pagination {
  next_key: string;
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

export const getFinalityProviders = async (
  key: string,
): Promise<FinalityProviders> => {

  const limit = 100;
  const reverse = false;

  const params = {
    "pagination.key": encode(key),
    "pagination.reverse": reverse,
    "pagination.limit": limit,
  };

  const reponse = await apiWrapper(
    "GET",
    "/v1/finality-providers",
    "Error getting finality providers",
    params,
  );
  
  return reponse.data;
};
