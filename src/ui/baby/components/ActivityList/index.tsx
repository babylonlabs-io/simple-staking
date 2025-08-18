import { useState } from "react";

import babylon from "@/infrastructure/babylon";
import { usePendingOperationsService } from "@/ui/baby/hooks/services/usePendingOperationsService";
import {
  type Delegation,
  useDelegationState,
} from "@/ui/baby/state/DelegationState";
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
  const {
    getTotalPendingOperations,
    getTotalPendingStake,
    getTotalPendingUnstake,
  } = usePendingOperationsService();
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

  const totalPendingOperations = getTotalPendingOperations();
  const hasPendingOperations = totalPendingOperations > 0n;
  const totalPendingStake = getTotalPendingStake();
  const totalPendingUnstake = getTotalPendingUnstake();
  const netPendingAmount = totalPendingStake - totalPendingUnstake;

  const activityItems = delegations.map((delegation) => {
    const formattedAmount = babylon.utils.ubbnToBaby(
      delegation.amount - netPendingAmount,
    );
    // We subtract the total pending unstake from the delegation amount to get
    // the amount that is available for unbonding. The pending staked amount
    // is not available for unbonding.
    const avaliableAmountForUnbonding = delegation.amount - totalPendingUnstake;

    const details = [
      {
        label: "Commission",
        value: formatCommissionPercentage(delegation.validator.commission),
      },
      ...(hasPendingOperations
        ? [
            {
              label: "Pending",
              value: `${maxDecimals(ubbnToBaby(Number(netPendingAmount)), 6)} ${coinSymbol}`,
              collapsible: true,
              nestedDetails: [
                ...(totalPendingStake > 0n
                  ? [
                      {
                        label: "Pending Stake",
                        value: `${maxDecimals(ubbnToBaby(Number(totalPendingStake)), 6)} ${coinSymbol}`,
                      },
                    ]
                  : []),
                ...(totalPendingUnstake > 0n
                  ? [
                      {
                        label: "Pending Unbonding",
                        value: `${maxDecimals(ubbnToBaby(Number(totalPendingUnstake)), 6)} ${coinSymbol}`,
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
          avaliableAmountForUnbonding > 0
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
