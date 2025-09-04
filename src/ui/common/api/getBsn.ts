import { getNetworkConfigBBN } from "@/ui/common/config/network/bbn";

import { Bsn, BsnType } from "../types/bsn";
import { getBsnLogoUrl } from "../utils/bsnLogo";

import { apiWrapper } from "./apiWrapper";

export const BSN_TYPE_COSMOS: BsnType = "COSMOS";
export const BSN_TYPE_ROLLUP: BsnType = "ROLLUP";

const { chainId: BBN_CHAIN_ID } = getNetworkConfigBBN();

// BSN Configuration for different types and behaviors
export interface BsnConfig {
  modalTitle: string;
  filterLabels: {
    primary: string;
    secondary: string;
  };
  fpFilterBehavior: "active-inactive" | "allowlist-based";
}

export const BSN_CONFIGS: Record<string, BsnConfig> = {
  // Babylon Genesis
  [BBN_CHAIN_ID]: {
    modalTitle: "Select Babylon Genesis Finality Provider",
    filterLabels: {
      primary: "Active",
      secondary: "Inactive",
    },
    fpFilterBehavior: "active-inactive",
  },
  // Cosmos BSN config
  COSMOS: {
    modalTitle: "Select Cosmos Finality Provider",
    filterLabels: {
      primary: "Active",
      secondary: "Inactive",
    },
    fpFilterBehavior: "active-inactive",
  },
  // Roll-up BSN config
  ROLLUP: {
    modalTitle: "Select Roll Up Finality Provider",
    filterLabels: {
      primary: "Allow listed",
      secondary: "Non-Allow listed",
    },
    fpFilterBehavior: "allowlist-based",
  },
};

/**
 * Get BSN configuration based on BSN object
 */
export const getBsnConfig = (bsn?: Bsn): BsnConfig => {
  if (!bsn) return BSN_CONFIGS.COSMOS;

  // Check if it's Babylon Genesis first
  if (bsn.id === BBN_CHAIN_ID) {
    return BSN_CONFIGS[BBN_CHAIN_ID];
  }

  // Use type-based config
  return BSN_CONFIGS[bsn.type] || BSN_CONFIGS.COSMOS;
};

interface BsnAPI {
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

const createBSN = (bsn: BsnAPI): Bsn => ({
  id: bsn.id,
  name: bsn.name,
  description: bsn.description,
  activeTvl: bsn.active_tvl,
  logoUrl: getBsnLogoUrl(bsn.id),
  type: bsn.type,
  allowlist: bsn.allowlist,
});

/**
 * Determines if a BSN is Babylon Genesis
 */
export const isBabylonGenesisBsn = (bsn: Bsn): boolean =>
  bsn.id === BBN_CHAIN_ID;

export const getBSNs = async (): Promise<Bsn[]> => {
  const response = await apiWrapper<BsnDataResponse>(
    "GET",
    "/v2/bsn",
    "Error getting BSN list",
  );

  const { data } = response.data;
  return data.map(createBSN);
};
