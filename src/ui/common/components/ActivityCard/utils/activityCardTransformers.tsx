import { Status } from "@/ui/common/components/Delegations/DelegationList/components/Status";
import { Hash } from "@/ui/common/components/Hash/Hash";
import { getNetworkConfigBTC } from "@/ui/common/config/network/btc";
import {
  DelegationV2,
  DelegationV2StakingState,
  DelegationWithFP,
} from "@/ui/common/types/delegationsV2";
import { FinalityProvider } from "@/ui/common/types/finalityProviders";
import { satoshiToBtc } from "@/ui/common/utils/btc";
import { maxDecimals } from "@/ui/common/utils/maxDecimals";
import { durationTillNow } from "@/ui/common/utils/time";

import { createBsnFpGroupedDetails } from "../../../utils/bsnFpGroupingUtils";
import { ActivityCardData, ActivityCardDetailItem } from "../ActivityCard";

const { coinName, icon } = getNetworkConfigBTC();

export interface ActivityCardTransformOptions {
  showExpansionSection?: boolean;
  hideExpansionCompletely?: boolean;
  isBroadcastedVerifiedExpansion?: boolean;
}

/**
 * Transforms a delegation into ActivityCard data
 * Used by both main activity list and expansion history
 */
export function transformDelegationToActivityCard(
  delegation: DelegationV2 | DelegationWithFP,
  finalityProviderMap: Map<string, FinalityProvider>,
  options: ActivityCardTransformOptions = {},
  indexLabel?: string,
): ActivityCardData {
  // Create a delegation with FP for the Status component if not already present
  const delegationWithFP =
    "fp" in delegation
      ? delegation
      : ({
          ...delegation,
          fp:
            Array.isArray(delegation.finalityProviderBtcPksHex) &&
            delegation.finalityProviderBtcPksHex.length > 0
              ? // Use the first FP [0] for backward compatibility with Status component
                // which expects a single FP. The full BSN/FP pairs are handled separately
                // in groupedDetails for comprehensive display
                finalityProviderMap.get(delegation.finalityProviderBtcPksHex[0])
              : undefined,
        } as DelegationWithFP);

  const details: ActivityCardDetailItem[] = [
    {
      label: "Status",
      value: (
        <Status
          delegation={delegationWithFP}
          showTooltip={true}
          isBroadcastedVerifiedExpansion={
            options.isBroadcastedVerifiedExpansion
          }
        />
      ),
    },
    {
      label: "Inception",
      value: delegation.bbnInceptionTime
        ? durationTillNow(delegation.bbnInceptionTime, Date.now(), false)
        : "N/A",
    },
    {
      label: "Tx Hash",
      value: (
        <Hash
          value={delegation.stakingTxHashHex}
          address
          small
          noFade
          size="caption"
        />
      ),
    },
  ];

  // Create grouped details for BSN/FP pairs using shared utility
  const groupedDetails = createBsnFpGroupedDetails(
    delegation.finalityProviderBtcPksHex,
    finalityProviderMap,
  );

  // Handle expansion section if options specify it
  let expansionSection: DelegationWithFP | undefined;
  if (options.showExpansionSection) {
    // Check if expansion section should be shown
    // 1. Delegation is active and can expand (existing logic)
    // 2. Delegation is a pending expansion transaction (new logic)
    const isActiveAndCanExpand =
      delegation.state === DelegationV2StakingState.ACTIVE &&
      delegation.canExpand;

    const isPendingExpansion =
      delegation.previousStakingTxHashHex &&
      (delegation.state ===
        DelegationV2StakingState.INTERMEDIATE_PENDING_BTC_CONFIRMATION ||
        delegation.state === DelegationV2StakingState.VERIFIED);

    const showExpansionSection = isActiveAndCanExpand || isPendingExpansion;

    expansionSection = showExpansionSection ? delegationWithFP : undefined;
  }

  const baseAmount = `${maxDecimals(satoshiToBtc(delegation.stakingAmount), 8)} ${coinName}`;
  const formattedAmount = indexLabel
    ? `${indexLabel} - ${baseAmount}`
    : baseAmount;

  return {
    formattedAmount,
    icon: icon,
    iconAlt: "bitcoin",
    details,
    groupedDetails: groupedDetails.length > 0 ? groupedDetails : undefined,
    expansionSection,
    hideExpansionCompletely: options.hideExpansionCompletely,
    isBroadcastedVerifiedExpansion: options.isBroadcastedVerifiedExpansion,
  };
}
