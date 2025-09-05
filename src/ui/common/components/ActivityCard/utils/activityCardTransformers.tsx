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
  isBroadcastedExpansion?: boolean;
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
  let delegationWithFP =
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

  // Transform the state for broadcasted expansions to show correct status
  if (options.isBroadcastedExpansion) {
    delegationWithFP = {
      ...delegationWithFP,
      state: DelegationV2StakingState.INTERMEDIATE_PENDING_BTC_CONFIRMATION,
    };
  }

  const details: ActivityCardDetailItem[] = [
    {
      label: "Status",
      value: <Status delegation={delegationWithFP} showTooltip={true} />,
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
  let isPendingExpansion = false;

  if (options.showExpansionSection) {
    // Check if expansion section should be shown
    // 1. Delegation is active and can expand from the api
    // 2. OR delegation is a broadcasted VERIFIED expansion (waiting for confirmations)
    const isActiveExpandable =
      delegation.state === DelegationV2StakingState.ACTIVE &&
      delegation.canExpand;

    const showExpansionSection =
      isActiveExpandable || options.isBroadcastedExpansion;

    if (showExpansionSection) {
      expansionSection = delegationWithFP;
      isPendingExpansion = !!options.isBroadcastedExpansion;
    }
  }

  const baseAmount = `${maxDecimals(satoshiToBtc(delegation.stakingAmount), 8)} ${coinName}`;
  const formattedAmount = indexLabel
    ? `${indexLabel} - ${baseAmount}`
    : baseAmount;

  // Determine if we should show the expansion pending banner
  const showExpansionPendingBanner = !!options.isBroadcastedExpansion;

  return {
    formattedAmount,
    icon: icon,
    iconAlt: "bitcoin",
    details,
    groupedDetails: groupedDetails.length > 0 ? groupedDetails : undefined,
    expansionSection,
    isPendingExpansion,
    showExpansionPendingBanner,
    hideExpansionCompletely: options.hideExpansionCompletely,
  };
}
