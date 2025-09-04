import logger from "@/infrastructure/logger";
import { getNetworkConfigBBN } from "@/ui/common/config/network/bbn";

import { getBsnAPI } from "../api/getBsn";
import { Bsn, BsnType } from "../types/bsn";
import { getBsnLogoUrl } from "../utils/bsnLogo";

const { chainId: BBN_CHAIN_ID } = getNetworkConfigBBN();

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
      { value: "registered", label: "Registered" },
      { value: "slashed", label: "Slashed" },
    ],
    fpFilterBehavior: "status-based",
  },
  // Roll-up BSN config
  ROLLUP: {
    modalTitle: "Select Roll Up Finality Provider",
    filterOptions: [
      { value: "allowlisted", label: "Allow Listed" },
      { value: "non-allowlisted", label: "Non-Allow Listed" },
      { value: "slashed", label: "Slashed" },
      { value: "jailed", label: "Jailed" },
    ],
    fpFilterBehavior: "allowlist-based",
  },
};

/**
 * Get BSN configuration based on BSN type
 */
export const getBsnConfig = (bsn?: Bsn): BsnConfig => {
  if (!bsn) return BSN_CONFIGS[BBN_CHAIN_ID];

  // Check if it's Babylon Genesis first
  if (bsn.id === BBN_CHAIN_ID) {
    return BSN_CONFIGS[BBN_CHAIN_ID];
  }

  // Use type-based config
  const config = BSN_CONFIGS[bsn.type];
  if (!config) {
    logger.error(new Error(`BSN config not found for type: ${bsn.type}`), {
      tags: { service: "bsnService", function: "getBsnConfig" },
      data: {
        bsnType: bsn.type,
        bsnId: bsn.id,
        fallback: "Babylon Genesis config",
      },
    });
    return BSN_CONFIGS[BBN_CHAIN_ID];
  }
  return config;
};

/**
 * Determines if a BSN is Babylon Genesis
 */
export const isBabylonGenesisBsn = (bsn: Bsn): boolean =>
  bsn.id === BBN_CHAIN_ID;

export const createBSN = (bsn: {
  id: string;
  name: string;
  description: string;
  active_tvl: number;
  type: BsnType;
  allowlist?: string[];
}): Bsn => ({
  id: bsn.id,
  name: bsn.name,
  description: bsn.description,
  activeTvl: bsn.active_tvl,
  logoUrl: getBsnLogoUrl(bsn.id),
  type: bsn.type,
  allowlist: bsn.allowlist,
});

/**
 */
export const getBSNs = async (): Promise<Bsn[]> => {
  const data = await getBsnAPI();
  return data.map(createBSN);
};
