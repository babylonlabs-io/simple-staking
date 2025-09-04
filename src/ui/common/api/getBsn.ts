import { getNetworkConfigBBN } from "@/ui/common/config/network/bbn";

import { Bsn, BsnType } from "../types/bsn";
import { getBsnLogoUrl } from "../utils/bsnLogo";

import { apiWrapper } from "./apiWrapper";

export const BSN_TYPE_COSMOS: BsnType = "COSMOS";
export const BSN_TYPE_ROLLUP: BsnType = "ROLLUP";

const { chainId: BBN_CHAIN_ID } = getNetworkConfigBBN();

// BSN Configuration for different types and behaviors
export interface BsnFilterOption {
  value: string;
  label: string;
}

export interface BsnConfig {
  modalTitle: string;
  filterOptions: BsnFilterOption[];
  fpFilterBehavior: "status-based" | "allowlist-based";
}

export const BSN_CONFIGS: Record<string, BsnConfig> = {
  // Babylon Genesis
  [BBN_CHAIN_ID]: {
    modalTitle: "Select Babylon Genesis Finality Provider",
    filterOptions: [
      { value: "active", label: "Active" },
      { value: "inactive", label: "Inactive" },
      { value: "jailed", label: "Jailed" },
      { value: "slashed", label: "Slashed" },
    ],
    fpFilterBehavior: "status-based",
  },
  COSMOS: {
    modalTitle: "Select Cosmos Finality Provider",
    filterOptions: [
      { value: "active", label: "Active" },
      { value: "inactive", label: "Inactive" },
    ],
    fpFilterBehavior: "status-based",
  },
  // Roll-up BSN config
  ROLLUP: {
    modalTitle: "Select Roll Up Finality Provider",
    filterOptions: [
      { value: "active", label: "Allowlisted" },
      { value: "inactive", label: "Not Allowlisted" },
    ],
    fpFilterBehavior: "allowlist-based",
  },
};

/**
 * Get BSN configuration based on BSN object
 */
export const getBsnConfig = (bsn?: Bsn): BsnConfig => {
  if (!bsn) return BSN_CONFIGS[BBN_CHAIN_ID];

  // Check if it's Babylon Genesis first
  if (bsn.id === BBN_CHAIN_ID) {
    return BSN_CONFIGS[BBN_CHAIN_ID];
  }

  // Use type-based config
  return BSN_CONFIGS[bsn.type] || BSN_CONFIGS[BBN_CHAIN_ID];
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
