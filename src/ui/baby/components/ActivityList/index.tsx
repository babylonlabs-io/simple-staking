import { useState } from "react";

import babylon from "@/infrastructure/babylon";
import { usePendingOperationsService } from "@/ui/baby/hooks/services/usePendingOperationsService";
import {
  type Delegation,
  useDelegationState,
} from "@/ui/baby/state/DelegationState";
import { Hint } from "@/ui/common/components/Common/Hint";
import { getNetworkConfigBBN } from "@/ui/common/config/network/bbn";
import { ubbnToBaby } from "@/ui/common/utils/bbn";
import { formatCommissionPercentage } from "@/ui/common/utils/formatCommissionPercentage";
import { maxDecimals } from "@/ui/common/utils/maxDecimals";

import { BabyActivityCard } from "../ActivityCard";
import { UnbondingModal } from "../UnbondingModal";
import { ValidatorAvatar } from "../ValidatorAvatar";

const { logo, coinSymbol } = getNetworkConfigBBN();

interface UnbondingModalState {
  isOpen: boolean;
  delegation: Delegation | null;
}

export function BabyActivityList() {
  const { loading, delegations, unbond } = useDelegationState();
  const { getPendingStake, getPendingUnstake } = usePendingOperationsService();
  const [unbondingModal, setUnbondingModal] = useState<UnbondingModalState>({
    isOpen: false,
    delegation: null,
  });

  const openUnbondingModal = (delegation: Delegation) => {
    setUnbondingModal({
      isOpen: true,
      delegation,
    });
  };

  const closeUnbondingModal = () => {
    setUnbondingModal({
      isOpen: false,
      delegation: null,
    });
  };

  const handleUnbond = async (amount: string) => {
    if (!unbondingModal.delegation) return;
    closeUnbondingModal();
    await unbond({
      validatorAddress: unbondingModal.delegation.validator.address,
      amount,
    });
  };

  const activityItems = delegations.map((delegation) => {
    // Get validator-specific pending operations
    const pendingStake = getPendingStake(delegation.validator.address);
    console.log("pendingStake", pendingStake);
    const pendingUnstake = getPendingUnstake(delegation.validator.address);
    console.log("pendingUnstake", pendingUnstake);

    const validatorPendingStake = pendingStake?.amount || 0n;
    const validatorPendingUnstake = pendingUnstake?.amount || 0n;
    const validatorNetPendingAmount =
      validatorPendingStake - validatorPendingUnstake;
    const hasValidatorPendingOperations =
      validatorPendingStake > 0n || validatorPendingUnstake > 0n;

    const formattedAmount = babylon.utils.ubbnToBaby(delegation.amount);

    // We subtract the validator-specific pending unstake from the delegation
    // amount to get the amount that is available for unbonding. The pending
    // staked amount also being added into the delegation amount, so we need to
    // subtract it.
    const availableAmountForUnbonding =
      delegation.amount - validatorPendingUnstake - validatorPendingStake;

    const details = [
      {
        label: "Commission",
        value: formatCommissionPercentage(delegation.validator.commission),
      },
      ...(hasValidatorPendingOperations
        ? [
            {
              label: "Pending",
              value: `${maxDecimals(ubbnToBaby(Number(validatorNetPendingAmount)), 6)} ${coinSymbol}`,
              collapsible: true,
              nestedDetails: [
                ...(validatorPendingStake > 0n
                  ? [
                      {
                        label: (
                          <Hint tooltip="Your stake will be activated in the next epoch, which takes around 1 hour">
                            Pending Stake
                          </Hint>
                        ),
                        value: `${maxDecimals(ubbnToBaby(Number(validatorPendingStake)), 6)} ${coinSymbol}`,
                      },
                    ]
                  : []),
                ...(validatorPendingUnstake > 0n
                  ? [
                      {
                        label: (
                          <Hint tooltip="It will take 50 hours for the amount to be liquid">
                            Pending Unbonding
                          </Hint>
                        ),
                        value: `${maxDecimals(ubbnToBaby(Number(validatorPendingUnstake)), 6)} ${coinSymbol}`,
                      },
                    ]
                  : []),
              ],
            },
          ]
        : []),
    ];

    return {
      delegation,
      data: {
        icon: logo,
        iconAlt: `${coinSymbol} Logo`,
        chainName: delegation.validator.name || delegation.validator.address,
        chainIcon: (
          <ValidatorAvatar
            size="small"
            name={delegation.validator.name || delegation.validator.address}
          />
        ),
        chainIconAlt: delegation.validator.name || delegation.validator.address,
        formattedAmount: `${formattedAmount} ${coinSymbol}`,
        primaryAction:
          availableAmountForUnbonding > 0
            ? {
                label: "Unbond",
                variant: "contained" as const,
                onClick: () => openUnbondingModal(delegation),
              }
            : undefined,
        details,
        optionalDetails: [],
      },
    };
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-accent-secondary">Loading delegations...</div>
      </div>
    );
  }

  if (activityItems.length === 0) {
    return (
      <div className="flex flex-col pb-16 pt-6 text-accent-primary gap-4 text-center items-center justify-center">
        <h4 className="text-xl font-semibold">No BABY Stakes</h4>
        <p className="text-base">
          No activity found. Start by staking some BABY tokens.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {activityItems.map(({ delegation, data }) => (
          <BabyActivityCard
            key={delegation.validator.address}
            activityData={data}
          />
        ))}
      </div>

      <UnbondingModal
        open={unbondingModal.isOpen}
        delegation={unbondingModal.delegation}
        onClose={closeUnbondingModal}
        onSubmit={handleUnbond}
      />
    </>
  );
}
