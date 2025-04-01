import { useCallback } from "react";
import { IoMdWarning } from "react-icons/io";

import { SlashingModal } from "@/app/components/Modals/SlashingModal";
import { StakeModal } from "@/app/components/Modals/StakeModal";
import { SubmitModal } from "@/app/components/Modals/SubmitModal";
import { UnbondModal } from "@/app/components/Modals/UnbondModal";
import { WithdrawModal } from "@/app/components/Modals/WithdrawModal";
import { DELEGATION_ACTIONS as ACTIONS } from "@/app/constants";
import { ActionType } from "@/app/hooks/services/useDelegationService";
import { DelegationWithFP } from "@/app/types/delegationsV2";
import { FinalityProviderState } from "@/app/types/finalityProviders";
import { BbnStakingParamsVersion } from "@/app/types/networkInfo";
import { NetworkConfig } from "@/config/network";

interface ConfirmationModalProps {
  processing: boolean;
  action: ActionType | undefined;
  delegation: DelegationWithFP | null;
  onSubmit: (action: ActionType, delegation: DelegationWithFP) => void;
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
        open={
          delegation?.fp.state === FinalityProviderState.ACTIVE &&
          action === ACTIONS.STAKE
        }
        onSubmit={handleSubmit}
        {...restProps}
      />
      <SubmitModal
        open={
          delegation?.fp.state === FinalityProviderState.INACTIVE &&
          action === ACTIONS.STAKE
        }
        icon={<IoMdWarning className="text-5xl text-primary-light" />}
        title="Finality Provider is Inactive"
        submitButton="Continue"
        cancelButton="Cancel"
        onSubmit={handleSubmit}
        {...restProps}
      >
        The finality provider you selected is not currently active, so you won’t
        earn rewards for your stake unless it becomes active. You can proceed
        with this choice or select a different, active finality provider.
      </SubmitModal>
      <SubmitModal
        open={
          delegation?.fp.state === FinalityProviderState.JAILED &&
          action === ACTIONS.STAKE
        }
        icon={<IoMdWarning className="text-5xl text-primary-light" />}
        title="Finality Provider is Jailed"
        submitButton="Continue"
        cancelButton="Cancel"
        onSubmit={handleSubmit}
        {...restProps}
      >
        The finality provider you selected is currently jailed, so you won’t
        earn rewards for your stake unless it becomes active. You can proceed
        with this choice or select a different, active finality provider.
      </SubmitModal>
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
