import { apiWrapper } from "./apiWrapper";

interface GlobalParams {
  data: GlobalParamsData;
}

export interface GlobalParamsData {
  tag: string;
  covenant_pks: string[];
  finality_providers: FinalityProviderShort[];
  covenant_quorum: number;
  unbonding_time: number;
  max_staking_amount: number;
  min_staking_amount: number;
  max_staking_time: number;
  min_staking_time: number;
}

interface FinalityProviderShort {
  description: Description;
  commission: string;
  btc_pk: string;
}

interface Description {
  moniker: string;
  identity: string;
  website: string;
  security_contact: string;
  details: string;
}

export const getGlobalParams = async (): Promise<GlobalParams> => {
  const reponse = await apiWrapper(
    "GET",
    "/v1/global-params",
    "Error getting global params",
  );
  return reponse.data;
};
