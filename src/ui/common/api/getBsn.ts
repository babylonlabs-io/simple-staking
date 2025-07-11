import { Bsn } from "../types/bsn";

import { apiWrapper } from "./apiWrapper";

interface BsnAPI {
  id: string;
  name: string;
  description: string;
  active_tvl: number;
}

interface BsnDataResponse {
  data: BsnAPI[];
}

const createBSN = (bsn: BsnAPI): Bsn => ({
  id: bsn.id,
  name: bsn.name,
  description: bsn.description,
  activeTvl: bsn.active_tvl,
});

export const getBSNs = async (): Promise<Bsn[]> => {
  const response = await apiWrapper<BsnDataResponse>(
    "GET",
    "/v2/bsn",
    "Error getting BSN list",
  );

  const { data } = response.data;
  return data.map(createBSN);
};
