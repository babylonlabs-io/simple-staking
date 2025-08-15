import { useMemo, useState } from "react";

import babylon from "@/infrastructure/babylon";
import {
  type Delegation,
  useDelegationState,
} from "@/ui/baby/state/DelegationState";
import { getNetworkConfigBBN } from "@/ui/common/config/network/bbn";
import { formatCommissionPercentage } from "@/ui/common/utils/formatCommissionPercentage";
import { formatTimeRemaining } from "@/ui/common/utils/time";

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

  const activityItems = useMemo(() => {
    return delegations.map((delegation) => {
      const formattedAmount = babylon.utils.ubbnToBaby(delegation.amount);
      const isUnbonding = delegation.status === "unbonding";

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
          chainIconAlt:
            delegation.validator.name || delegation.validator.address,
          formattedAmount: `${formattedAmount} ${coinSymbol}`,
          primaryAction:
            formattedAmount > 0
              ? {
                  label: "Unbond",
                  variant: "contained" as const,
                  onClick: () => openUnbondingModal(delegation),
                }
              : undefined,
          details: [
            {
              label: "Commission",
              value: formatCommissionPercentage(
                delegation.validator.commission,
              ),
            },
            ...(isUnbonding
              ? [
                  {
                    label: "Pending",
                    value: delegation.unbondingInfo
                      ? `${babylon.utils.ubbnToBaby(delegation.unbondingInfo.amount)} ${coinSymbol}`
                      : "In progress...",
                    collapsible: Boolean(delegation.unbondingInfo),
                    nestedDetails: delegation.unbondingInfo
                      ? [
                          {
                            label: "Amount",
                            value: `${babylon.utils.ubbnToBaby(delegation.unbondingInfo.amount)} ${coinSymbol}`,
                          },
                          {
                            label: "Time Remaining",
                            value: delegation.unbondingInfo.isOptimistic
                              ? "Processing"
                              : `${formatTimeRemaining(delegation.unbondingInfo.completionTime)}${delegation.unbondingInfo.statusSuffix || ""}`,
                          },
                        ]
                      : [],
                  },
                ]
              : []),
          ],
          optionalDetails: [],
        },
      };
    });
  }, [delegations]);

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
