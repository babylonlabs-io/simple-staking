import { useFormContext } from "@babylonlabs-io/core-ui";
import { useMemo } from "react";

import { CancelFeedbackModal } from "@/ui/common/components/Modals/CancelFeedbackModal";
import { PreviewModal } from "@/ui/common/components/Modals/PreviewModal";
import { SignModal } from "@/ui/common/components/Modals/SignModal/SignModal";
import { StakeModal } from "@/ui/common/components/Modals/StakeModal";
import { SuccessFeedbackModal } from "@/ui/common/components/Modals/SuccessFeedbackModal";
import { VerificationModal } from "@/ui/common/components/Modals/VerificationModal";
import { useStakingExpansionService } from "@/ui/common/hooks/services/useStakingExpansionService";
import { useDelegationV2State } from "@/ui/common/state/DelegationV2State";
import { useFinalityProviderState } from "@/ui/common/state/FinalityProviderState";
import {
  StakingExpansionStep,
  useStakingExpansionState,
} from "@/ui/common/state/StakingExpansionState";

import { SignDetailsModal } from "../Modals/SignDetailsModal";

import { StakingExpansionModal } from "./StakingExpansionModal";

const EOI_INDEXES: Record<string, number> = {
  "eoi-staking-slashing": 1,
  "eoi-unbonding-slashing": 2,
  "eoi-proof-of-possession": 3,
  "eoi-sign-bbn": 4,
};

const VERIFICATION_STEPS: Record<string, 1 | 2> = {
  "eoi-send-bbn": 1,
  verifying: 2,
};

export function StakingExpansionModalSystem() {
  const {
    processing,
    step,
    formData,
    verifiedDelegation,
    reset: resetState,
    expansionStepOptions,
  } = useStakingExpansionState();

  const { getRegisteredFinalityProvider } = useFinalityProviderState();
  const { createExpansionEOI, stakeDelegationExpansion } =
    useStakingExpansionService();
  const { reset: resetForm, trigger: revalidateForm } = useFormContext() || {
    reset: () => {},
    trigger: () => {},
  };

  const { delegationV2StepOptions, setDelegationV2StepOptions } =
    useDelegationV2State();
  const detailsModalTitle =
    (delegationV2StepOptions?.type as string) ||
    "Expansion Transaction Details";

  // Get first finality provider for preview display
  const fp = useMemo(() => {
    if (!formData || !Object.keys(formData.selectedBsnFps).length) return null;
    const firstFpPkHex = Object.values(formData.selectedBsnFps)[0];
    return getRegisteredFinalityProvider(firstFpPkHex);
  }, [formData, getRegisteredFinalityProvider]);

  if (!step) {
    return null;
  }

  const handleClose = () => {
    resetState();
    setDelegationV2StepOptions?.(undefined);
  };

  return (
    <>
      {step === StakingExpansionStep.BSN_FP_SELECTION && (
        <StakingExpansionModal open onClose={handleClose} />
      )}
      {step === StakingExpansionStep.PREVIEW && formData && fp && (
        <PreviewModal
          open
          processing={processing}
          finalityProvider={fp.description.moniker}
          finalityProviderAvatar={fp.description.identity}
          stakingAmountSat={formData.originalDelegation.stakingAmount}
          stakingTimelock={formData.stakingTimelock}
          stakingFeeSat={formData.feeAmount}
          feeRate={formData.feeRate}
          unbondingFeeSat={0} // Not applicable for expansion
          onClose={handleClose}
          onSign={async () => {
            await createExpansionEOI(formData);
            resetForm();
            revalidateForm();
          }}
        />
      )}
      {Boolean(EOI_INDEXES[step]) && (
        <SignModal
          open
          processing={processing}
          step={EOI_INDEXES[step]}
          title="Staking Expansion"
          options={expansionStepOptions}
        />
      )}
      {Boolean(VERIFICATION_STEPS[step]) && (
        <VerificationModal
          open
          processing={processing}
          step={VERIFICATION_STEPS[step]}
        />
      )}
      {verifiedDelegation && (
        <StakeModal
          open={step === StakingExpansionStep.VERIFIED}
          processing={processing}
          onSubmit={() => stakeDelegationExpansion(verifiedDelegation)}
          onClose={handleClose}
        />
      )}
      <SuccessFeedbackModal
        open={step === StakingExpansionStep.FEEDBACK_SUCCESS}
        onClose={handleClose}
      />
      <CancelFeedbackModal
        open={step === StakingExpansionStep.FEEDBACK_CANCEL}
        onClose={handleClose}
      />
      <SignDetailsModal
        open={Boolean(delegationV2StepOptions) && processing}
        onClose={() => setDelegationV2StepOptions?.(undefined)}
        details={delegationV2StepOptions}
        title={detailsModalTitle}
      />
    </>
  );
}
