import { useMemo } from "react";

import bitcoin from "@/ui/common/assets/bitcoin.png";
import { DelegationStatus } from "@/ui/common/components/Delegations/components/DelegationStatus";
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
import {
  DelegationV2StakingState,
  DelegationWithFP,
} from "@/ui/common/types/delegationsV2";
import { FinalityProviderState } from "@/ui/common/types/finalityProviders";
import { satoshiToBtc } from "@/ui/common/utils/btc";
import { maxDecimals } from "@/ui/common/utils/maxDecimals";
import { durationTillNow } from "@/ui/common/utils/time";

import {
  ActivityCard,
  ActivityCardActionButton,
  ActivityCardData,
  ActivityCardDetailItem,
  ActivityListItemData,
} from "../../ActivityCard/ActivityCard";
import { DelegationModal } from "../../Delegations/components/DelegationModal";
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
): ActivityCardData => {
  const details: ActivityCardDetailItem[] = [
    {
      label: "Status",
      value: <DelegationStatus delegation={delegation} showTooltip={false} />,
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

  const listItems: {
    label: string;
    items: ActivityListItemData[];
  }[] = [];

  if (delegation.fp?.bsnId) {
    const bsnLogo = chainLogos[delegation.fp.bsnId] || chainLogos.placeholder;
    listItems.push({
      label: "BSN",
      items: [
        {
          icon: bsnLogo,
          iconAlt: delegation.fp.bsnId,
          name: delegation.fp.bsnId,
          id: delegation.fp.bsnId,
        },
      ],
    });
  }

  // Finality Provider Section
  if (delegation.fp) {
    listItems.push({
      label: "Finality Provider",
      items: [
        {
          icon: (
            <FinalityProviderLogo
              logoUrl={delegation.fp.logo_url}
              rank={delegation.fp.rank}
              moniker={delegation.fp.description?.moniker}
              className="w-4 h-4"
            />
          ),
          iconAlt: delegation.fp.description?.moniker || "Finality Provider",
          name:
            delegation.fp.description?.moniker ||
            `Provider ${delegation.fp.rank}`,
          id: delegation.fp.btcPk,
        },
      ],
    });
  }

  // Reward Section (placeholder for future implementation)
  // listItems.push({
  //   label: "Reward",
  //   items: [{
  //   }]
  // });

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
    listItems: listItems.length > 0 ? listItems : undefined,
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
        ),
      );
  }, [delegations, validations, openConfirmationModal, isStakingManagerReady]);

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
    </>
  );
}
