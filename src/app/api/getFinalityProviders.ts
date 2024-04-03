import axios from "axios";

interface FinalityProviders {
  data: FinalityProvider[];
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

export const getFinalityProviders = async (): Promise<FinalityProviders> => {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/v1/finality-providers`,
    );

    return response.data;
  } catch (error) {
    const generalErrorMessage = "Error getting finality providers";

    if (axios.isAxiosError(error)) {
      const message = error?.response?.data?.message;
      throw new Error(generalErrorMessage, message);
    } else {
      throw new Error(generalErrorMessage);
    }
  }
};
