import { useFormContext } from "@babylonlabs-io/core-ui";
import { useMemo } from "react";

import { CancelFeedbackModal } from "@/ui/components/Modals/CancelFeedbackModal";
import { PreviewMultistakingModal } from "@/ui/components/Modals/PreviewMultistakingModal";
import { SignModal } from "@/ui/components/Modals/SignModal/SignModal";
import { StakeModal } from "@/ui/components/Modals/StakeModal";
import { SuccessFeedbackModal } from "@/ui/components/Modals/SuccessFeedbackModal";
import { VerificationModal } from "@/ui/components/Modals/VerificationModal";
import { useStakingService } from "@/ui/hooks/services/useStakingService";
import { useFinalityProviderState } from "@/ui/state/FinalityProviderState";
import { useStakingState } from "@/ui/state/StakingState";
import { trim } from "@/ui/utils/trim";

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

export function MultistakingModal() {
  const {
    processing,
    step,
    formData,
    stakingInfo,
    verifiedDelegation,
    reset: resetState,
    stakingStepOptions,
  } = useStakingState();
  const { getRegisteredFinalityProvider } = useFinalityProviderState();
  const { createEOI, stakeDelegation } = useStakingService();

  const {
    reset: resetForm,
    trigger: revalidateForm,
    setValue: setFieldValue,
  } = useFormContext();

  // Build provider info list for preview
  const providerInfos = useMemo(() => {
    return (formData?.finalityProviders ?? [])
      .map((pk) => {
        const provider = getRegisteredFinalityProvider(pk);
        if (!provider) return null;
        return {
          name: provider.description?.moniker || trim(pk, 8),
          avatar: provider.description?.identity,
        };
      })
      .filter(Boolean) as { name: string; avatar?: string }[];
  }, [formData?.finalityProviders, getRegisteredFinalityProvider]);

  if (!step) return null;

  return (
    <>
      {step === "preview" && stakingInfo && (
        <PreviewMultistakingModal
          open
          processing={processing}
          providers={providerInfos}
          stakingAmountSat={formData?.amount ?? 0}
          stakingTimelock={formData?.term ?? 0}
          stakingFeeSat={formData?.feeAmount ?? 0}
          feeRate={formData?.feeRate ?? 0}
          unbondingFeeSat={stakingInfo.unbondingFeeSat}
          onClose={resetState}
          onSign={async () => {
            if (!formData) return;
            await createEOI(formData);
            resetForm({
              finalityProviders: undefined,
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
          options={stakingStepOptions}
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
