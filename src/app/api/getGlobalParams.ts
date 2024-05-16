import { AxiosResponse } from "axios";
import { apiWrapper } from "./apiWrapper";

export interface globalParamsDataResponse {
  versions: {
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
  }[];
}

export interface GlobalParamsVersion {
  version: number;
  activationHeight: number;
  stakingCap: number;
  tag: string;
  covenantPks: string[];
  covenantQuorum: number;
  unbondingTime: number;
  unbondingFee: number;
  maxStakingAmount: number;
  minStakingAmount: number;
  maxStakingTime: number;
  minStakingTime: number;
}

export const getGlobalParams = async (): Promise<GlobalParamsVersion[]> => {
  const { data } = await apiWrapper(
    "GET",
    "/v1/global-params",
    "Error getting global params",
  ) as AxiosResponse<{ data: globalParamsDataResponse }>;
  const { versions } = data.data;

  // covert them into GlobalParamsVersion
  return versions.map((v) => ({
    version: v.version,
    activationHeight: v.activation_height,
    stakingCap: v.staking_cap,
    tag: v.tag,
    covenantPks: v.covenant_pks,
    covenantQuorum: v.covenant_quorum,
    unbondingTime: v.unbonding_time,
    unbondingFee: v.unbonding_fee,
    maxStakingAmount: v.max_staking_amount,
    minStakingAmount: v.min_staking_amount,
    maxStakingTime: v.max_staking_time,
    minStakingTime: v.min_staking_time,
  }))
};
