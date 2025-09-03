import { useMemo, type PropsWithChildren } from "react";

import { useDelegationService } from "@/ui/common/hooks/services/useDelegationService";
import { useStakingManagerService } from "@/ui/common/hooks/services/useStakingManagerService";
import { useFinalityProviderState } from "@/ui/common/state/FinalityProviderState";
import { useStakingExpansionState } from "@/ui/common/state/StakingExpansionState";
import {
  DelegationV2,
  DelegationV2StakingState,
  DelegationWithFP,
} from "@/ui/common/types/delegationsV2";
import { createStateUtils } from "@/ui/common/utils/createStateUtils";

import { getActionButton } from "../components/ActivityCard/utils/actionButtonUtils";
import {
  ActivityCardTransformOptions,
  transformDelegationToActivityCard,
} from "../components/ActivityCard/utils/activityCardTransformers";

export interface ActivityCardData {
  formattedAmount: string;
  icon?: string | React.ReactNode;
  iconAlt?: string;
  details: any[];
  optionalDetails?: any[];
  listItems?: {
    label: string;
    items: any[];
  }[];
  groupedDetails?: {
    label?: string;
    items: any[];
  }[];
  primaryAction?: any;
  secondaryActions?: any[];
  expansionSection?: any;
  hideExpansionCompletely?: boolean;
  isBroadcastedVerifiedExpansion?: boolean;
  stakingTxHashHex: string;
  hasExpandableExpansions?: boolean;
}

interface ActivityListState {
  activityList: ActivityCardData[];
  isLoading: boolean;
  isEmpty: boolean;
}

const { StateProvider, useState: useActivityListState } =
  createStateUtils<ActivityListState>({
    activityList: [],
    isLoading: false,
    isEmpty: false,
  });

export function ActivityListState({ children }: PropsWithChildren) {
  const {
    delegations,
    rawApiDelegations,
    isLoading,
    validations,
    openConfirmationModal,
  } = useDelegationService();

  const { isLoading: isStakingManagerLoading } = useStakingManagerService();
  const isStakingManagerReady = !isStakingManagerLoading;

  const { finalityProviderMap } = useFinalityProviderState();

  const { expansions: localExpansions } = useStakingExpansionState();

  const activityList = useMemo(() => {
    // Pre-compute data structures for O(1) lookups to avoid O(n²) complexity
    const rawApiDelegationTxHashes = new Set(
      rawApiDelegations.map((apiDelegation) => apiDelegation.stakingTxHashHex),
    );

    const localExpansionsMap = new Map(
      localExpansions.map((expansion) => [
        expansion.stakingTxHashHex,
        expansion,
      ]),
    );

    // Group expansions by their original staking transaction hash for efficient lookup
    const expansionsByOriginalTxHash = new Map<string, typeof delegations>();
    delegations.forEach((delegation) => {
      if (delegation.previousStakingTxHashHex) {
        const existing =
          expansionsByOriginalTxHash.get(delegation.previousStakingTxHashHex) ||
          [];
        existing.push(delegation);
        expansionsByOriginalTxHash.set(
          delegation.previousStakingTxHashHex,
          existing,
        );
      }
    });

    const afterValidation = delegations.filter((delegation) => {
      const { valid } = validations[delegation.stakingTxHashHex];
      return valid;
    });

    const afterExpanded = afterValidation.filter(
      // Filter out expanded delegations as they are now part of the
      // expanded delegation. User can find it from delegation history.
      (delegation) => {
        const isExpanded =
          delegation.state === DelegationV2StakingState.EXPANDED;
        return !isExpanded;
      },
    );

    const result = afterExpanded.filter((delegation) => {
      // Handle VERIFIED expansion transactions
      // VERIFIED expansions should only show in Activity tab if they were broadcast-tracked by the user
      if (
        delegation.previousStakingTxHashHex &&
        delegation.state === DelegationV2StakingState.VERIFIED
      ) {
        // Check if this expansion exists in raw API (O(1) lookup)
        const isInRawAPI = rawApiDelegationTxHashes.has(
          delegation.stakingTxHashHex,
        );

        // Check if this expansion was broadcast-tracked by the user (O(1) lookup)
        const localExpansion = localExpansionsMap.get(
          delegation.stakingTxHashHex,
        );
        const hasLocalBroadcastState =
          localExpansion &&
          localExpansion.state !== DelegationV2StakingState.VERIFIED;
        const isBroadcastTracked = isInRawAPI && hasLocalBroadcastState;

        return isBroadcastTracked; // Only show if broadcast-tracked
      }

      // Check if original staking should be hidden due to broadcast-tracked expansions (O(1) lookup)
      const relatedExpansions =
        expansionsByOriginalTxHash.get(delegation.stakingTxHashHex) || [];
      const hasBroadcastTrackedExpansion = relatedExpansions.some((other) => {
        // Expansion is broadcast-tracked if:
        // 1. INTERMEDIATE_PENDING_BTC_CONFIRMATION or ACTIVE (clearly broadcast-tracked)
        // 2. VERIFIED and exists in both API and local expansions (user-broadcast and confirmed)
        if (
          other.state ===
            DelegationV2StakingState.INTERMEDIATE_PENDING_BTC_CONFIRMATION ||
          other.state === DelegationV2StakingState.ACTIVE
        ) {
          return true; // Clearly broadcast-tracked
        }

        if (other.state === DelegationV2StakingState.VERIFIED) {
          // Use pre-computed sets for O(1) lookups
          const isInRawAPI = rawApiDelegationTxHashes.has(
            other.stakingTxHashHex,
          );
          const localExpansion = localExpansionsMap.get(other.stakingTxHashHex);
          const hasLocalBroadcastState =
            localExpansion &&
            localExpansion.state !== DelegationV2StakingState.VERIFIED;
          return isInRawAPI && hasLocalBroadcastState; // Broadcast-tracked if in API and has local broadcast state
        }

        return false;
      });

      return !hasBroadcastTrackedExpansion;
    });

    const finalResult = result.map((delegation) => {
      // Determine if this VERIFIED expansion is actually broadcasted (O(1) lookup)
      const isBroadcastedVerifiedExpansion =
        delegation.previousStakingTxHashHex &&
        delegation.state === DelegationV2StakingState.VERIFIED &&
        rawApiDelegationTxHashes.has(delegation.stakingTxHashHex);

      // Check if this delegation has expandable expansions
      const relatedExpansions =
        expansionsByOriginalTxHash.get(delegation.stakingTxHashHex) || [];
      const hasExpandableExpansions = relatedExpansions.length > 0;

      const options: ActivityCardTransformOptions = {
        showExpansionSection: true,
        isBroadcastedVerifiedExpansion: isBroadcastedVerifiedExpansion
          ? true
          : undefined,
      };
      const cardData = transformDelegationToActivityCard(
        delegation,
        finalityProviderMap,
        options,
      );

      // Create delegation with FP for action button
      // delegations from useDelegationService are DelegationV2 objects
      const delegation_v2 = delegation as DelegationV2;
      // Use the first FP [0] for backward compatibility with action button logic
      // which expects a single FP to determine button state. The full BSN/FP pairs
      // are properly displayed in the card's grouped details section
      const fp =
        Array.isArray(delegation_v2.finalityProviderBtcPksHex) &&
        delegation_v2.finalityProviderBtcPksHex.length > 0
          ? finalityProviderMap.get(delegation_v2.finalityProviderBtcPksHex[0])
          : undefined;
      const delegationWithFP: DelegationWithFP = {
        ...delegation_v2,
        fp,
      } as DelegationWithFP;

      // Add action button if applicable (but not for broadcasted VERIFIED expansions)
      const validation = validations[delegation.stakingTxHashHex];
      const primaryAction = isBroadcastedVerifiedExpansion
        ? undefined // No action button for already broadcasted expansions
        : getActionButton(
            delegationWithFP,
            openConfirmationModal,
            isStakingManagerReady,
            validation,
          );

      return {
        ...cardData,
        primaryAction,
        stakingTxHashHex: delegation.stakingTxHashHex,
        isBroadcastedVerifiedExpansion: isBroadcastedVerifiedExpansion
          ? true
          : undefined,
        hasExpandableExpansions,
      };
    });

    return finalResult;
  }, [
    delegations,
    rawApiDelegations,
    localExpansions,
    validations,
    openConfirmationModal,
    isStakingManagerReady,
    finalityProviderMap,
  ]);

  const isEmpty = activityList.length === 0;

  const state: ActivityListState = useMemo(
    () => ({
      activityList,
      isLoading,
      isEmpty,
    }),
    [activityList, isLoading, isEmpty],
  );

  return <StateProvider value={state}>{children}</StateProvider>;
}

export { useActivityListState };
