import { useMemo } from "react";

import { ExpansionHistoryModal } from "@/ui/common/components/ExpansionHistory/ExpansionHistoryModal";
import { getNetworkConfig } from "@/ui/common/config/network";
import { useDelegationService } from "@/ui/common/hooks/services/useDelegationService";
import { useStakingManagerService } from "@/ui/common/hooks/services/useStakingManagerService";
import { useFinalityProviderState } from "@/ui/common/state/FinalityProviderState";
import { useStakingExpansionState } from "@/ui/common/state/StakingExpansionState";
import {
  DelegationV2,
  DelegationV2StakingState,
  DelegationWithFP,
} from "@/ui/common/types/delegationsV2";

import { ActivityCard } from "../../ActivityCard/ActivityCard";
import { getActionButton } from "../../ActivityCard/utils/actionButtonUtils";
import {
  ActivityCardTransformOptions,
  transformDelegationToActivityCard,
} from "../../ActivityCard/utils/activityCardTransformers";
import { DelegationModal } from "../../Delegations/DelegationList/components/DelegationModal";
import { StakingExpansionModalSystem } from "../../StakingExpansion/StakingExpansionModalSystem";

const networkConfig = getNetworkConfig();

export function ActivityList() {
  const {
    processing,
    confirmationModal,
    delegations,
    isLoading,
    validations,
    executeDelegationAction,
    openConfirmationModal,
    closeConfirmationModal,
  } = useDelegationService();

  const { isLoading: isStakingManagerLoading } = useStakingManagerService();
  const isStakingManagerReady = !isStakingManagerLoading;

  const { finalityProviderMap } = useFinalityProviderState();

  const {
    expansionHistoryModalOpen,
    expansionHistoryTargetDelegation,
    closeExpansionHistoryModal,
  } = useStakingExpansionState();

  const activityList = useMemo(() => {
    return delegations
      .filter((delegation) => {
        const { valid } = validations[delegation.stakingTxHashHex];
        return valid;
      })
      .filter(
        // Filter out expanded delegations as they are now part of the
        // expanded delegation. User can find it from delegation history.
        (delegation) => {
          const isExpanded =
            delegation.state === DelegationV2StakingState.EXPANDED;
          return !isExpanded;
        },
      )
      .filter((delegation) => {
        // Only filter out VERIFIED expansion transactions (not broadcasted yet)
        // ACTIVE expansions should show in Activity tab
        if (
          delegation.previousStakingTxHashHex &&
          delegation.state === DelegationV2StakingState.VERIFIED
        ) {
          return false;
        }

        // Only filter out original transactions if they have BROADCASTED expansions
        const hasBroadcastedExpansion = delegations.some(
          (other) =>
            other.previousStakingTxHashHex === delegation.stakingTxHashHex &&
            (other.state ===
              DelegationV2StakingState.INTERMEDIATE_PENDING_BTC_CONFIRMATION ||
              other.state === DelegationV2StakingState.ACTIVE),
        );
        return !hasBroadcastedExpansion;
      })
      .map((delegation) => {
        const options: ActivityCardTransformOptions = {
          showExpansionSection: true,
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
            ? finalityProviderMap.get(
                delegation_v2.finalityProviderBtcPksHex[0],
              )
            : undefined;
        const delegationWithFP: DelegationWithFP = {
          ...delegation_v2,
          fp,
        } as DelegationWithFP;

        // Add action button if applicable
        const validation = validations[delegation.stakingTxHashHex];
        const primaryAction = getActionButton(
          delegationWithFP,
          openConfirmationModal,
          isStakingManagerReady,
          validation,
        );

        return {
          ...cardData,
          primaryAction,
        };
      });
  }, [
    delegations,
    validations,
    openConfirmationModal,
    isStakingManagerReady,
    finalityProviderMap,
  ]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-accent-secondary">Loading delegations...</div>
      </div>
    );
  }

  if (activityList.length === 0) {
    return (
      <div className="flex flex-col pb-16 pt-6 text-accent-primary gap-4 text-center items-center justify-center">
        <h4 className="text-xl font-semibold">
          No {networkConfig.bbn.networkFullName} Stakes
        </h4>
        <p className="text-base">No activity found.</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {activityList.map((data, index) => (
          <ActivityCard
            key={delegations[index]?.stakingTxHashHex || index}
            data={data}
          />
        ))}
      </div>

      <DelegationModal
        action={confirmationModal?.action}
        delegation={confirmationModal?.delegation ?? null}
        param={confirmationModal?.param ?? null}
        processing={processing}
        onSubmit={executeDelegationAction}
        onClose={closeConfirmationModal}
        networkConfig={networkConfig}
      />

      <StakingExpansionModalSystem />

      <ExpansionHistoryModal
        open={expansionHistoryModalOpen}
        onClose={closeExpansionHistoryModal}
        targetDelegation={expansionHistoryTargetDelegation}
        allDelegations={delegations}
      />
    </>
  );
}
