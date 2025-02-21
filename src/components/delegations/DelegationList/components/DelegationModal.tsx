import { useCallback } from "react";

import { SlashingModal } from "@/app/components/Modals/SlashingModal";
import { StakeModal } from "@/app/components/Modals/StakeModal";
import { UnbondModal } from "@/app/components/Modals/UnbondModal";
import { WithdrawModal } from "@/app/components/Modals/WithdrawModal";
import { DELEGATION_ACTIONS as ACTIONS } from "@/app/constants";
import { ActionType } from "@/app/hooks/services/useDelegationService";
import { DelegationV2 } from "@/app/types/delegationsV2";
import { BbnStakingParamsVersion } from "@/app/types/networkInfo";
import { NetworkConfig } from "@/config/network";

interface ConfirmationModalProps {
  processing: boolean;
  action: ActionType | undefined;
  delegation: DelegationV2 | null;
  onSubmit: (action: ActionType, delegation: DelegationV2) => void;
  onClose: () => void;
  networkConfig: NetworkConfig;
  param: BbnStakingParamsVersion | null;
}

export function DelegationModal({
  action,
  delegation,
  onSubmit,
  ...restProps
}: ConfirmationModalProps) {
  const handleSubmit = useCallback(() => {
    if (!action || !delegation) return;

    onSubmit(action, delegation);
  }, [action, delegation, onSubmit]);

  return (
    <>
      <StakeModal
        open={action === ACTIONS.STAKE}
        onSubmit={handleSubmit}
        {...restProps}
      />
      <UnbondModal
        open={action === ACTIONS.UNBOND}
        onSubmit={handleSubmit}
        {...restProps}
      />
      <WithdrawModal
        open={action === ACTIONS.WITHDRAW_ON_EARLY_UNBONDING}
        onSubmit={handleSubmit}
        {...restProps}
      />
      <WithdrawModal
        open={action === ACTIONS.WITHDRAW_ON_TIMELOCK}
        onSubmit={handleSubmit}
        {...restProps}
      />
      <SlashingModal
        open={action === ACTIONS.WITHDRAW_ON_EARLY_UNBONDING_SLASHING}
        onSubmit={handleSubmit}
        {...restProps}
      />
      <SlashingModal
        open={action === ACTIONS.WITHDRAW_ON_TIMELOCK_SLASHING}
        onSubmit={handleSubmit}
        {...restProps}
      />
    </>
  );
}
