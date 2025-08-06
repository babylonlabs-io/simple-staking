import { useMemo, useState } from "react";

import babylon from "@/infrastructure/babylon";
import {
  type Delegation,
  useDelegationState,
} from "@/ui/baby/state/DelegationState";
import { getNetworkConfigBBN } from "@/ui/common/config/network/bbn";

import { BabyActivityCard } from "../ActivityCard";
import { UnbondingModal } from "../UnbondingModal";

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

    try {
      await unbond({
        validatorAddress: unbondingModal.delegation.validator.address,
        amount,
      });
      closeUnbondingModal();
    } catch (error) {
      // Error is already handled in the delegation state
    }
  };

  const activityItems = useMemo(() => {
    return delegations.map((delegation) => {
      const formattedAmount = babylon.utils.ubbnToBaby(delegation.amount);
      const isUnbonding = delegation.status === "unbonding";

      return {
        delegation,
        data: {
          icon: logo,
          formattedAmount: `${formattedAmount} ${coinSymbol}`,
          primaryAction: isUnbonding
            ? undefined
            : {
                label: "Unbond",
                variant: "contained" as const,
                onClick: () => openUnbondingModal(delegation),
              },
          details: [],
          optionalDetails: [
            {
              label: "Validator",
              value: delegation.validator.name || delegation.validator.address,
            },
            {
              label: "Commission",
              value: `${(delegation.validator.commission * 100).toFixed(2)}%`,
            },
            {
              label: "Shares",
              value: delegation.shares.toFixed(6),
            },
            {
              label: "Status",
              value: isUnbonding ? "Unbonding" : "Active",
            },
            {
              label: "Voting Power",
              value: `${(delegation.validator.votingPower * 100).toFixed(2)}%`,
            },
          ],
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
        {activityItems.map(({ data }) => (
          <BabyActivityCard
            key={data.validator.address}
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
