import { BsnType } from "../types/bsn";

import { apiWrapper } from "./apiWrapper";

export const BSN_TYPE_COSMOS: BsnType = "COSMOS";
export const BSN_TYPE_ROLLUP: BsnType = "ROLLUP";

export interface BsnAPI {
  id: string;
  name: string;
  description: string;
  active_tvl: number;
  type: BsnType;
  allowlist?: string[]; // BTC FP pubkeys (hex)
}

interface BsnDataResponse {
  data: BsnAPI[];
}

export const getBsnAPI = async (): Promise<BsnAPI[]> => {
  const response = await apiWrapper<BsnDataResponse>(
    "GET",
    "/v2/bsn",
    "Error getting BSN list",
  );

  return response.data.data;
};
