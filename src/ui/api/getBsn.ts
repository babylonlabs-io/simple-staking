import { Bsn } from "../types/bsn";

import { apiWrapper } from "./apiWrapper";

interface ETHL2MetadataAPI {
  finality_contract_address: string;
}

interface BsnAPI {
  _id: string;
  name: string;
  description: string;
  max_multi_staked_fps: number;
  type: string;
  rollup_metadata?: ETHL2MetadataAPI;
}

interface BsnDataResponse {
  data: BsnAPI[];
}

const createBSN = (bsn: BsnAPI): Bsn => ({
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

export const getBSNs = async (): Promise<Bsn[]> => {
  const response = await apiWrapper<BsnDataResponse>(
    "GET",
    "/v2/bsn",
    "Error getting BSN list",
  );

  return response.data.data.map(createBSN);
};
