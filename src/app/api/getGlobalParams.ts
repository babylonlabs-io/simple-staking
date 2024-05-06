import { apiWrapper } from "./apiWrapper";

interface GlobalParams {
  data: GlobalParamsData;
}

export interface GlobalParamsData {
  versions: Version[];
}

export interface Version {
  version: number;
  activation_height: number;
  staking_cap: number;
  tag: string;
  covenant_pks: string[];
  covenant_quorum: number;
  unbonding_time: number;
  unbonding_fee: number;
  max_staking_amount: number;
  min_staking_amount: number;
  max_staking_time: number;
  min_staking_time: number;
}

export const getGlobalParams = async (): Promise<GlobalParams> => {
  const reponse = await apiWrapper(
    "GET",
    "/v1/global-params",
    "Error getting global params",
  );
  return reponse.data;
};
