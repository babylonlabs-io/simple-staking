import { getNetworkConfigBBN } from "@/ui/common/config/network/bbn";
import { Bsn } from "@/ui/common/types/bsn";
import {
  FinalityProviderState as FinalityProviderStateEnum,
  type FinalityProvider,
} from "@/ui/common/types/finalityProviders";

const { chainId: BBN_CHAIN_ID } = getNetworkConfigBBN();

/**
 * Normalizes hex string by removing 0x prefix and converting to lowercase
 */
export const normalizeHex = (hex?: string): string =>
  (hex ?? "").trim().toLowerCase().replace(/^0x/, "");

// BSN-specific status filters to handle different BSN behaviors
const BABYLON_STATUS_FILTERS = {
  active: (fp: FinalityProvider) =>
    fp.state === FinalityProviderStateEnum.ACTIVE,
  inactive: (fp: FinalityProvider) =>
    fp.state === FinalityProviderStateEnum.INACTIVE,
  jailed: (fp: FinalityProvider) =>
    fp.state === FinalityProviderStateEnum.JAILED,
  slashed: (fp: FinalityProvider) =>
    fp.state === FinalityProviderStateEnum.SLASHED,
};

const COSMOS_STATUS_FILTERS = {
  registered: (fp: FinalityProvider) =>
    fp.state === FinalityProviderStateEnum.INACTIVE,
  slashed: (fp: FinalityProvider) =>
    fp.state === FinalityProviderStateEnum.SLASHED,
};

const BSN_STATUS_FILTERS = {
  [BBN_CHAIN_ID]: BABYLON_STATUS_FILTERS,
  COSMOS: COSMOS_STATUS_FILTERS,
};

/**
 * Creates allowlist filters for BSN-based filtering
 */
export const createAllowlistFilters = (selectedBsn: Bsn | undefined) => {
  const allowSet = new Set((selectedBsn?.allowlist || []).map(normalizeHex));

  return {
    allowlisted: (fp: FinalityProvider) => allowSet.has(normalizeHex(fp.btcPk)),
    "non-allowlisted": (fp: FinalityProvider) =>
      !allowSet.has(normalizeHex(fp.btcPk)),
  };
};

/**
 * Applies standard status filtering for BABYLON and COSMOS BSNs
 */
export const applyStandardStatusFilter = (
  providers: FinalityProvider[],
  filterValue: string,
  bsnKey: string,
): FinalityProvider[] => {
  const bsnStatusFilters =
    BSN_STATUS_FILTERS[bsnKey] || BSN_STATUS_FILTERS[BBN_CHAIN_ID];
  const statusFilter =
    bsnStatusFilters[filterValue as keyof typeof bsnStatusFilters];
  return statusFilter ? providers.filter(statusFilter) : providers;
};

export interface FinalityProviderFilterState {
  searchTerm: string;
  providerStatus:
    | "active"
    | "inactive"
    | "registered"
    | "allowlisted"
    | "non-allowlisted"
    | "slashed"
    | "jailed"
    | "";
  allowlistStatus: "allowlisted" | "non-allowlisted" | "";
}

/**
 * Main filtering function that applies BSN-aware filtering logic
 * Handles both allowlist-based and status-based filtering behaviors
 */
export const filterFinalityProvidersByBsn = (
  providers: FinalityProvider[],
  filter: FinalityProviderFilterState,
  selectedBsn: Bsn | undefined,
  fpFilterBehavior: "status-based" | "allowlist-based",
): FinalityProvider[] => {
  let filtered = providers;

  // Apply BSN-aware filtering based on provider status
  if (filter.providerStatus) {
    if (fpFilterBehavior === "allowlist-based") {
      // For rollup BSNs: filter FPs by allowlist status or specific states
      const allowSet = new Set(
        (selectedBsn?.allowlist || []).map(normalizeHex),
      );

      filtered = filtered.filter((fp) => {
        const isAllowlisted = allowSet.has(normalizeHex(fp.btcPk));

        if (filter.providerStatus === "allowlisted") {
          return isAllowlisted;
        } else if (filter.providerStatus === "non-allowlisted") {
          return !isAllowlisted;
        } else if (filter.providerStatus === "slashed") {
          return fp.state === FinalityProviderStateEnum.SLASHED;
        } else if (filter.providerStatus === "jailed") {
          return fp.state === FinalityProviderStateEnum.JAILED;
        }
        return true;
      });
    } else if (fpFilterBehavior === "status-based") {
      // For status-based BSNs: filter by finality provider state using BSN-specific filters
      const bsnKey =
        selectedBsn?.id === BBN_CHAIN_ID
          ? BBN_CHAIN_ID
          : selectedBsn?.type || BBN_CHAIN_ID;

      filtered = applyStandardStatusFilter(
        filtered,
        filter.providerStatus,
        bsnKey,
      );
    }
  }

  if (filter.allowlistStatus) {
    const allowlistFilters = createAllowlistFilters(selectedBsn);
    const allowlistFilter =
      allowlistFilters[filter.allowlistStatus as keyof typeof allowlistFilters];
    if (allowlistFilter) {
      filtered = filtered.filter(allowlistFilter);
    }
  }

  return filtered;
};

/**
 * Determines if a finality provider row should be selectable based on BSN rules
 */
export const isFinalityProviderRowSelectable = (
  row: FinalityProvider,
  selectedBsnId: string | undefined,
  selectedBsn: Bsn | undefined,
): boolean => {
  const statusAllowed =
    row.state === FinalityProviderStateEnum.ACTIVE ||
    row.state === FinalityProviderStateEnum.INACTIVE;

  // For selection (not filtering), only restrict based on allowlist for non-Babylon BSNs
  const allowlistAllowed =
    !selectedBsnId ||
    selectedBsnId === BBN_CHAIN_ID ||
    (selectedBsn?.allowlist || []).some(
      (allowedPk) => normalizeHex(allowedPk) === normalizeHex(row.btcPk),
    );

  return statusAllowed && allowlistAllowed;
};
