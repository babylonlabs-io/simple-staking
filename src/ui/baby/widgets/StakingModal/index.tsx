import { PreviewModal, useFormContext } from "@babylonlabs-io/core-ui";

import babylon from "@/infrastructure/babylon";
import { ValidatorAvatar } from "@/ui/baby/components/ValidatorAvatar";
import { getNetworkConfigBBN } from "@/ui/common/config/network/bbn";
import { DEFAULT_CONFIRMATION_DEPTH } from "@/ui/common/constants";
import { useNetworkInfo } from "@/ui/common/hooks/client/api/useNetworkInfo";
import { maxDecimals } from "@/ui/common/utils/maxDecimals";

import { LoadingModal } from "../../components/LoadingModal";
import { SuccessModal } from "../../components/SuccessModal";
import { useStakingState } from "../../state/StakingState";

export function StakingModal() {
  const { step, closePreview, submitForm } = useStakingState();
  const { reset } = useFormContext();
  const { coinSymbol } = getNetworkConfigBBN();
  const { data: networkInfo } = useNetworkInfo();
  const confirmationDepth =
    networkInfo?.params.btcEpochCheckParams?.latestParam
      ?.btcConfirmationDepth || DEFAULT_CONFIRMATION_DEPTH;
  const processingHours = Math.ceil(confirmationDepth / 6);
  const processingHourLabel = processingHours === 1 ? "hour" : "hours";
  const warnings = [
    `The staking transaction may take up to ~${processingHours} ${processingHourLabel} to process. Funds will not be deducted instantly; a sufficient available balance must be maintained until the transaction is confirmed and the deduction is finalized.`,
  ];

  return (
    <>
      {step.name === "preview" && step.data && (
        <PreviewModal
          open
          processing={false}
          bsns={[
            {
              icon: (
                <ValidatorAvatar
                  url={step.data.validator.url}
                  name={step.data.validator.name}
                  variant="rounded"
                  size="tiny"
                />
              ),
              name: step.data.validator.name,
            },
          ]}
          finalityProviders={[]}
          details={{
            stakeAmount: `${maxDecimals(
              babylon.utils.ubbnToBaby(BigInt(step.data.amount)),
              6,
            )} ${coinSymbol}`,
            feeRate: "",
            transactionFees: `${maxDecimals(
              babylon.utils.ubbnToBaby(BigInt(step.data.feeAmount)),
              6,
            )} ${coinSymbol}`,
            term: { blocks: "", duration: "" },
            unbonding: "",
            unbondingFee: "",
          }}
          visibleFields={["Stake Amount", "Transaction Fees"]}
          warnings={warnings}
          onClose={closePreview}
          onProceed={submitForm}
          proceedLabel="Stake"
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
