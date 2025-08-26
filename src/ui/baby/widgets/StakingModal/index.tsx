import { useFormContext } from "@babylonlabs-io/core-ui";

import { LoadingModal } from "../../components/LoadingModal";
import { PreviewModal } from "../../components/PreviewModal";
import { SuccessModal } from "../../components/SuccessModal";
import { useStakingState } from "../../state/StakingState";

export function StakingModal() {
  const { step, closePreview, submitForm } = useStakingState();
  const { reset } = useFormContext();

  return (
    <>
      {step.name === "preview" && step.data && (
        <PreviewModal
          open
          data={step.data}
          onClose={closePreview}
          onSubmit={submitForm}
        />
      )}
      {step.name === "signing" && (
        <LoadingModal
          title="Signing in progress"
          description="Please sign the transaction in your wallet to continue"
        />
      )}
      {step.name === "loading" && (
        <LoadingModal
          title="Processing"
          description="Babylon Genesis is processing your stake"
        />
      )}
      {step.name === "success" && (
        <SuccessModal
          title="Your BABY staking request has been submitted"
          description="Stakes activate within ~1 hour. Until then, keep the staked amount in your wallet to ensure successful processing."
          onClose={() => {
            closePreview();
            reset();
          }}
        />
      )}
    </>
  );
}
