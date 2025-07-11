import { useCallback } from "react";
import { IoMdWarning } from "react-icons/io";

import { SignDetailsModal } from "@/ui/common/components/Modals/SignDetailsModal";
import { SlashingModal } from "@/ui/common/components/Modals/SlashingModal";
import { StakeModal } from "@/ui/common/components/Modals/StakeModal";
import { SubmitModal } from "@/ui/common/components/Modals/SubmitModal";
import { UnbondModal } from "@/ui/common/components/Modals/UnbondModal";
import { WithdrawModal } from "@/ui/common/components/Modals/WithdrawModal";
import { NetworkConfig } from "@/ui/common/config/network";
import { DELEGATION_ACTIONS as ACTIONS } from "@/ui/common/constants";
import { ActionType } from "@/ui/common/hooks/services/useDelegationService";
import { useDelegationV2State } from "@/ui/common/state/DelegationV2State";
import { DelegationWithFP } from "@/ui/common/types/delegationsV2";
import { FinalityProviderState } from "@/ui/common/types/finalityProviders";
import { BbnStakingParamsVersion } from "@/ui/common/types/networkInfo";

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

  const { delegationV2StepOptions, setDelegationV2StepOptions } =
    useDelegationV2State();

  const detailsModalTitle =
    (delegationV2StepOptions?.type as string) || "Transaction Details";

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
        unbondingFeeSat={restProps.param?.unbondingFeeSat}
        unbondingTimeInBlocks={restProps.param?.unbondingTime}
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
      <SignDetailsModal
        open={Boolean(delegationV2StepOptions) && restProps.processing}
        onClose={() => setDelegationV2StepOptions(undefined)}
        details={delegationV2StepOptions}
        title={detailsModalTitle}
      />
    </>
  );
}
