import { useMemo } from "react";

import { CancelFeedbackModal } from "@/app/components/Modals/CancelFeedbackModal";
import { EOIModal } from "@/app/components/Modals/EOIModal/EOIModal";
import { PreviewModal } from "@/app/components/Modals/PreviewModal";
import { StakeModal } from "@/app/components/Modals/StakeModal";
import { SuccessFeedbackModal } from "@/app/components/Modals/SuccessFeedbackModal";
import { VerificationModal } from "@/app/components/Modals/VerificationModal";
import { useStakingService } from "@/app/hooks/services/useStakingService";
import { useFinalityProviderState } from "@/app/state/FinalityProviderState";
import { useStakingState } from "@/app/state/StakingState";

const EOI_INDEXES: Record<string, number> = {
  "eoi-staking-slashing": 1,
  "eoi-unbonding-slashing": 2,
  "eoi-proof-of-possession": 3,
  "eoi-sign-bbn": 4,
  "eoi-send-bbn": 5,
};

export function StakingModal() {
  const { processing, step, formData, stakingInfo, verifiedDelegation, reset } =
    useStakingState();
  const { getFinalityProvider } = useFinalityProviderState();
  const { createEOI, stakeDelegation } = useStakingService();

  const fp = useMemo(
    () => getFinalityProvider(formData?.finalityProvider ?? ""),
    [formData, getFinalityProvider],
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
          onClose={reset}
          onSign={() => createEOI(formData)}
        />
      )}
      <EOIModal
        open={step.startsWith("eoi")}
        processing={processing}
        title="Staking"
        step={EOI_INDEXES[step] ?? 0}
      />
      <VerificationModal processing={processing} open={step === "verifying"} />
      {verifiedDelegation && (
        <StakeModal
          open={step === "verified"}
          processing={processing}
          onSubmit={() => stakeDelegation(verifiedDelegation)}
        />
      )}
      <SuccessFeedbackModal
        open={step === "feedback-success"}
        onClose={reset}
      />
      <CancelFeedbackModal open={step === "feedback-cancel"} onClose={reset} />
    </>
  );
}
