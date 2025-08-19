import { useMemo } from "react";

import bitcoin from "@/ui/common/assets/bitcoin.png";
import { Status } from "@/ui/common/components/Delegations/DelegationList/components/Status";
import { ExpansionHistoryModal } from "@/ui/common/components/ExpansionHistory/ExpansionHistoryModal";
import { Hash } from "@/ui/common/components/Hash/Hash";
import { FinalityProviderLogo } from "@/ui/common/components/Staking/FinalityProviders/FinalityProviderLogo";
import { getNetworkConfig } from "@/ui/common/config/network";
import { getNetworkConfigBTC } from "@/ui/common/config/network/btc";
import {
  DELEGATION_ACTIONS as ACTIONS,
  chainLogos,
} from "@/ui/common/constants";
import {
  ActionType,
  useDelegationService,
} from "@/ui/common/hooks/services/useDelegationService";
import { useStakingManagerService } from "@/ui/common/hooks/services/useStakingManagerService";
import { useFinalityProviderState } from "@/ui/common/state/FinalityProviderState";
import { useStakingExpansionState } from "@/ui/common/state/StakingExpansionState";
import {
  DelegationV2StakingState,
  DelegationWithFP,
} from "@/ui/common/types/delegationsV2";
import {
  FinalityProvider,
  FinalityProviderState,
} from "@/ui/common/types/finalityProviders";
import { satoshiToBtc } from "@/ui/common/utils/btc";
import { maxDecimals } from "@/ui/common/utils/maxDecimals";
import { durationTillNow } from "@/ui/common/utils/time";

import {
  ActivityCard,
  ActivityCardActionButton,
  ActivityCardData,
  ActivityCardDetailItem,
} from "../../ActivityCard/ActivityCard";
import { DelegationModal } from "../../Delegations/DelegationList/components/DelegationModal";
import { StakingExpansionModalSystem } from "../../StakingExpansion/StakingExpansionModalSystem";

const networkConfig = getNetworkConfig();
const { coinName } = getNetworkConfigBTC();

const getActionButton = (
  delegation: DelegationWithFP,
  onAction: (action: ActionType, delegation: DelegationWithFP) => void,
  isStakingManagerReady: boolean,
): ActivityCardActionButton | undefined => {
  const { state, fp } = delegation;

  // Define action mapping
  const actionMap: Record<
    string,
    Record<string, { action: ActionType; title: string }>
  > = {
    [FinalityProviderState.ACTIVE]: {
      [DelegationV2StakingState.VERIFIED]: {
        action: ACTIONS.STAKE,
        title: "Stake",
      },
      [DelegationV2StakingState.ACTIVE]: {
        action: ACTIONS.UNBOND,
        title: "Unbond",
      },
      [DelegationV2StakingState.EARLY_UNBONDING_WITHDRAWABLE]: {
        action: ACTIONS.WITHDRAW_ON_EARLY_UNBONDING,
        title: "Withdraw",
      },
      [DelegationV2StakingState.TIMELOCK_WITHDRAWABLE]: {
        action: ACTIONS.WITHDRAW_ON_TIMELOCK,
        title: "Withdraw",
      },
      [DelegationV2StakingState.TIMELOCK_SLASHING_WITHDRAWABLE]: {
        action: ACTIONS.WITHDRAW_ON_TIMELOCK_SLASHING,
        title: "Withdraw",
      },
      [DelegationV2StakingState.EARLY_UNBONDING_SLASHING_WITHDRAWABLE]: {
        action: ACTIONS.WITHDRAW_ON_EARLY_UNBONDING_SLASHING,
        title: "Withdraw",
      },
    },
    [FinalityProviderState.INACTIVE]: {
      [DelegationV2StakingState.VERIFIED]: {
        action: ACTIONS.STAKE,
        title: "Stake",
      },
      [DelegationV2StakingState.ACTIVE]: {
        action: ACTIONS.UNBOND,
        title: "Unbond",
      },
      [DelegationV2StakingState.EARLY_UNBONDING_WITHDRAWABLE]: {
        action: ACTIONS.WITHDRAW_ON_EARLY_UNBONDING,
        title: "Withdraw",
      },
      [DelegationV2StakingState.TIMELOCK_WITHDRAWABLE]: {
        action: ACTIONS.WITHDRAW_ON_TIMELOCK,
        title: "Withdraw",
      },
      [DelegationV2StakingState.TIMELOCK_SLASHING_WITHDRAWABLE]: {
        action: ACTIONS.WITHDRAW_ON_TIMELOCK_SLASHING,
        title: "Withdraw",
      },
      [DelegationV2StakingState.EARLY_UNBONDING_SLASHING_WITHDRAWABLE]: {
        action: ACTIONS.WITHDRAW_ON_EARLY_UNBONDING_SLASHING,
        title: "Withdraw",
      },
    },
    [FinalityProviderState.JAILED]: {
      [DelegationV2StakingState.VERIFIED]: {
        action: ACTIONS.STAKE,
        title: "Stake",
      },
      [DelegationV2StakingState.ACTIVE]: {
        action: ACTIONS.UNBOND,
        title: "Unbond",
      },
      [DelegationV2StakingState.EARLY_UNBONDING_WITHDRAWABLE]: {
        action: ACTIONS.WITHDRAW_ON_EARLY_UNBONDING,
        title: "Withdraw",
      },
      [DelegationV2StakingState.TIMELOCK_WITHDRAWABLE]: {
        action: ACTIONS.WITHDRAW_ON_TIMELOCK,
        title: "Withdraw",
      },
      [DelegationV2StakingState.TIMELOCK_SLASHING_WITHDRAWABLE]: {
        action: ACTIONS.WITHDRAW_ON_TIMELOCK_SLASHING,
        title: "Withdraw",
      },
      [DelegationV2StakingState.EARLY_UNBONDING_SLASHING_WITHDRAWABLE]: {
        action: ACTIONS.WITHDRAW_ON_EARLY_UNBONDING_SLASHING,
        title: "Withdraw",
      },
    },
    [FinalityProviderState.SLASHED]: {
      [DelegationV2StakingState.ACTIVE]: {
        action: ACTIONS.UNBOND,
        title: "Unbond",
      },
      [DelegationV2StakingState.EARLY_UNBONDING_WITHDRAWABLE]: {
        action: ACTIONS.WITHDRAW_ON_EARLY_UNBONDING,
        title: "Withdraw",
      },
      [DelegationV2StakingState.TIMELOCK_WITHDRAWABLE]: {
        action: ACTIONS.WITHDRAW_ON_TIMELOCK,
        title: "Withdraw",
      },
      [DelegationV2StakingState.TIMELOCK_SLASHING_WITHDRAWABLE]: {
        action: ACTIONS.WITHDRAW_ON_TIMELOCK_SLASHING,
        title: "Withdraw",
      },
      [DelegationV2StakingState.EARLY_UNBONDING_SLASHING_WITHDRAWABLE]: {
        action: ACTIONS.WITHDRAW_ON_EARLY_UNBONDING_SLASHING,
        title: "Withdraw",
      },
    },
  };

  const actionConfig = actionMap[fp?.state]?.[state];
  if (!actionConfig) return undefined;

  const isUnbondDisabled =
    state === DelegationV2StakingState.ACTIVE && !isStakingManagerReady;

  return {
    label: actionConfig.title,
    onClick: () => onAction(actionConfig.action, delegation),
    variant: "contained",
    size: "medium",
    className: isUnbondDisabled ? "opacity-50" : "",
  };
};

const transformToActivityCard = (
  delegation: DelegationWithFP,
  onAction: (action: ActionType, delegation: DelegationWithFP) => void,
  isStakingManagerReady: boolean,
  finalityProviderMap: Map<string, FinalityProvider>,
): ActivityCardData => {
  const details: ActivityCardDetailItem[] = [
    {
      label: "Status",
      value: <Status delegation={delegation} showTooltip={false} />,
    },
    {
      label: "Inception",
      value: delegation.bbnInceptionTime
        ? durationTillNow(delegation.bbnInceptionTime, Date.now())
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

  // Create grouped details for BSN/FP pairs
  const groupedDetails: { label?: string; items: ActivityCardDetailItem[] }[] =
    [];

  if (
    delegation.finalityProviderBtcPksHex &&
    delegation.finalityProviderBtcPksHex.length > 0
  ) {
    delegation.finalityProviderBtcPksHex.forEach((fpBtcPk) => {
      const fp = finalityProviderMap.get(fpBtcPk);
      if (fp && fp.bsnId) {
        const bsnLogo = chainLogos[fp.bsnId] || chainLogos.placeholder;

        // Create a group for each BSN+FP pair
        groupedDetails.push({
          items: [
            {
              label: "BSN",
              value: (
                <div className="flex items-center gap-2">
                  <img
                    src={bsnLogo}
                    alt={fp.bsnId}
                    className="w-4 h-4 rounded-full object-cover"
                  />
                  <span>{fp.bsnId}</span>
                </div>
              ),
            },
            {
              label: "Finality Provider",
              value: (
                <div className="flex items-center gap-2">
                  <FinalityProviderLogo
                    logoUrl={fp.logo_url}
                    rank={fp.rank}
                    moniker={fp.description?.moniker}
                    className="w-4 h-4"
                  />
                  <span>
                    {fp.description?.moniker || `Provider ${fp.rank}`}
                  </span>
                </div>
              ),
            },
          ],
        });
      }
    });
  }

  const primaryAction = getActionButton(
    delegation,
    onAction,
    isStakingManagerReady,
  );

  // Check if expansion section should be shown
  // 1. Feature flag enabled
  // 2. Delegation is active
  // 3. Delegation can expand from the api
  const showExpansionSection =
    delegation.state === DelegationV2StakingState.ACTIVE &&
    delegation.canExpand;

  return {
    formattedAmount: `${maxDecimals(satoshiToBtc(delegation.stakingAmount), 8)} ${coinName}`,
    icon: bitcoin,
    iconAlt: "bitcoin",
    details,
    groupedDetails: groupedDetails.length > 0 ? groupedDetails : undefined,
    primaryAction,
    expansionSection: showExpansionSection ? delegation : undefined,
  };
};

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
        (delegation) => delegation.state !== DelegationV2StakingState.EXPANDED,
      )
      .map((delegation) =>
        transformToActivityCard(
          delegation,
          openConfirmationModal,
          isStakingManagerReady,
          finalityProviderMap,
        ),
      );
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
