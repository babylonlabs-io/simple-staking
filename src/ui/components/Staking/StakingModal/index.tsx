import { useFormContext } from "@babylonlabs-io/core-ui";
import { useMemo } from "react";

import { CancelFeedbackModal } from "@/ui/components/Modals/CancelFeedbackModal";
import { PreviewModal } from "@/ui/components/Modals/PreviewModal";
import { SignModal } from "@/ui/components/Modals/SignModal/SignModal";
import { StakeModal } from "@/ui/components/Modals/StakeModal";
import { SuccessFeedbackModal } from "@/ui/components/Modals/SuccessFeedbackModal";
import { VerificationModal } from "@/ui/components/Modals/VerificationModal";
import { useStakingService } from "@/ui/hooks/services/useStakingService";
import { useFinalityProviderState } from "@/ui/state/FinalityProviderState";
import { useStakingState } from "@/ui/state/StakingState";

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

export function StakingModal() {
  const {
    processing,
    step,
    formData,
    stakingInfo,
    verifiedDelegation,
    reset: resetState,
  } = useStakingState();
  const { getRegisteredFinalityProvider } = useFinalityProviderState();
  const { createEOI, stakeDelegation } = useStakingService();
  const {
    reset: resetForm,
    trigger: revalidateForm,
    setValue: setFieldValue,
  } = useFormContext();

  const fp = useMemo(
    () => getRegisteredFinalityProvider(formData?.finalityProvider ?? ""),
    [formData, getRegisteredFinalityProvider],
  );

  if (!step) {
    return null;
  }

  return (
    <>
      {formData && fp && stakingInfo && (
        <PreviewModal
          open={step === "preview"}
          processing={processing}
          finalityProvider={fp.description.moniker}
          finalityProviderAvatar={fp.description.identity}
          stakingAmountSat={formData.amount}
          stakingTimelock={formData.term}
          stakingFeeSat={formData.feeAmount}
          feeRate={formData.feeRate}
          unbondingFeeSat={stakingInfo.unbondingFeeSat}
          onClose={resetState}
          onSign={async () => {
            await createEOI(formData);
            resetForm({
              finalityProvider: "",
              term: "",
              amount: "",
              feeRate: stakingInfo?.defaultFeeRate?.toString() ?? "0",
              feeAmount: "0",
            });
            if (stakingInfo?.defaultStakingTimeBlocks) {
              setFieldValue("term", stakingInfo?.defaultStakingTimeBlocks, {
                shouldDirty: true,
                shouldTouch: true,
              });
            }
            revalidateForm();
          }}
        />
      )}
      {Boolean(EOI_INDEXES[step]) && (
        <SignModal
          open
          processing={processing}
          step={EOI_INDEXES[step]}
          title="Staking"
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
          open={step === "verified"}
          processing={processing}
          onSubmit={() => stakeDelegation(verifiedDelegation)}
          onClose={resetState}
        />
      )}
      <SuccessFeedbackModal
        open={step === "feedback-success"}
        onClose={resetState}
      />
      <CancelFeedbackModal
        open={step === "feedback-cancel"}
        onClose={resetState}
      />
    </>
  );
}
