import { Bsn, BsnAPI } from "../types/bsn";

import { apiWrapper } from "./apiWrapper";

interface BsnDataResponse {
  data: BsnAPI[];
}

const apiToBsn = (bsn: BsnAPI): Bsn => ({
  id: bsn._id,
  name: bsn.name,
  description: bsn.description,
  maxMultiStakedFps: bsn.max_multi_staked_fps,
  type: bsn.type,
  rollupMetadata: bsn.rollup_metadata
    ? {
        finalityContractAddress: bsn.rollup_metadata.finality_contract_address,
      }
    : undefined,
});

export const getBsn = async (): Promise<Bsn[]> => {
  const response = await apiWrapper<BsnDataResponse>(
    "GET",
    "/v2/bsn",
    "Error getting BSN list",
  );

  return response.data.data.map(apiToBsn);
};
