import axios from "axios";

interface GlobalParams {
  data: GlobalParamsData;
}

interface GlobalParamsData {
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
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/v1/global-params`,
    );

    return response.data;
  } catch (error) {
    const generalErrorMessage = "Error getting global params";

    if (axios.isAxiosError(error)) {
      const message = error?.response?.data?.message;
      throw new Error(generalErrorMessage, message);
    } else {
      throw new Error(generalErrorMessage);
    }
  }
};
