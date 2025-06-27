import { Avatar, useFormContext, useWatch } from "@babylonlabs-io/core-ui";
import { useMemo } from "react";

import { CancelFeedbackModal } from "@/ui/components/Modals/CancelFeedbackModal";
import { MultistakingPreviewModal } from "@/ui/components/Modals/MultistakingModal/MultistakingStartModal";
import { SignModal } from "@/ui/components/Modals/SignModal/SignModal";
import { StakeModal } from "@/ui/components/Modals/StakeModal";
import { SuccessFeedbackModal } from "@/ui/components/Modals/SuccessFeedbackModal";
import { VerificationModal } from "@/ui/components/Modals/VerificationModal";
import { FinalityProviderLogo } from "@/ui/components/Staking/FinalityProviders/FinalityProviderLogo";
import { getNetworkConfigBTC } from "@/ui/config/network/btc";
import { chainLogos } from "@/ui/constants";
import { useNetworkInfo } from "@/ui/hooks/client/api/useNetworkInfo";
import { usePrice } from "@/ui/hooks/client/api/usePrices";
import { useStakingService } from "@/ui/hooks/services/useStakingService";
import { useFinalityProviderBsnState } from "@/ui/state/FinalityProviderBsnState";
import { useFinalityProviderState } from "@/ui/state/FinalityProviderState";
import { useStakingState } from "@/ui/state/StakingState";
import { satoshiToBtc } from "@/ui/utils/btc";
import FeatureFlagService from "@/ui/utils/FeatureFlagService";
import { calculateTokenValueInCurrency } from "@/ui/utils/formatCurrency";
import { maxDecimals } from "@/ui/utils/maxDecimals";
import { blocksToDisplayTime } from "@/ui/utils/time";
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
  const { bsnList } = useFinalityProviderBsnState();
  const { createEOI, stakeDelegation } = useStakingService();

  const {
    reset: resetForm,
    trigger: revalidateForm,
    setValue: setFieldValue,
  } = useFormContext();

  const { coinSymbol } = getNetworkConfigBTC();
  const { data: networkInfo } = useNetworkInfo();
  const btcInUsd = usePrice(coinSymbol);

  // Get the current form field value directly to preserve BSN-FP mapping
  const currentFinalityProviders = useWatch({ name: "finalityProviders" });

  // Build BSN and FP info for preview
  const { bsnInfos, finalityProviderInfos } = useMemo(() => {
    const bsns: Array<{ icon: React.ReactNode; name: string }> = [];
    const fps: Array<{ icon: React.ReactNode; name: string }> = [];

    if (currentFinalityProviders) {
      // If currentFinalityProviders is a Record (multistaking), process BSN-FP pairs
      if (
        typeof currentFinalityProviders === "object" &&
        !Array.isArray(currentFinalityProviders)
      ) {
        const providerMap = currentFinalityProviders as Record<string, string>;

        Object.entries(providerMap).forEach(([bsnId, fpPublicKey]) => {
          // Get BSN info - in Phase 3 use actual BSN, in non-Phase 3 use babylon
          const actualBsnId = FeatureFlagService.IsPhase3Enabled
            ? bsnId
            : "babylon";
          const bsn = bsnList.find((bsn) => bsn.id === actualBsnId);

          if (bsn) {
            const logoUrl =
              chainLogos[bsn.id || "babylon"] || chainLogos.placeholder;
            bsns.push({
              icon: (
                <Avatar
                  url={logoUrl}
                  alt={bsn.name}
                  variant="rounded"
                  size="tiny"
                />
              ),
              name: bsn.name,
            });
          }

          // Get FP info
          const provider = getRegisteredFinalityProvider(fpPublicKey);
          if (provider) {
            fps.push({
              icon: (
                <FinalityProviderLogo
                  logoUrl={provider.logo_url}
                  rank={provider.rank}
                  moniker={provider.description?.moniker}
                  className="w-5 h-5"
                />
              ),
              name: provider.description?.moniker || trim(fpPublicKey, 8),
            });
          }
        });
      } else {
        // If currentFinalityProviders is an array (single staking), process FPs and show Babylon BSN
        const fpArray = Array.isArray(currentFinalityProviders)
          ? currentFinalityProviders
          : [];

        fpArray.forEach((fpPublicKey) => {
          // For single staking, always use babylon as BSN
          const bsn = bsnList.find((bsn) => bsn.id === "babylon");
          if (bsn) {
            const logoUrl =
              chainLogos[bsn.id || "babylon"] || chainLogos.placeholder;
            bsns.push({
              icon: (
                <Avatar
                  url={logoUrl}
                  alt={bsn.name}
                  variant="rounded"
                  size="tiny"
                />
              ),
              name: bsn.name,
            });
          }

          const provider = getRegisteredFinalityProvider(fpPublicKey);
          if (provider) {
            fps.push({
              icon: (
                <FinalityProviderLogo
                  logoUrl={provider.logo_url}
                  rank={provider.rank}
                  moniker={provider.description?.moniker}
                  className="w-5 h-5"
                />
              ),
              name: provider.description?.moniker || trim(fpPublicKey, 8),
            });
          }
        });
      }
    }

    return { bsnInfos: bsns, finalityProviderInfos: fps };
  }, [currentFinalityProviders, bsnList, getRegisteredFinalityProvider]);

  // Build details object for the new modal
  const details = useMemo(() => {
    if (!formData || !stakingInfo) return null;

    const unbondingTime =
      blocksToDisplayTime(
        networkInfo?.params.bbnStakingParams?.latestParam?.unbondingTime,
      ) || "7 days";

    const stakeAmountBtc = maxDecimals(satoshiToBtc(formData.amount), 8);
    const stakeAmountUsd = calculateTokenValueInCurrency(
      satoshiToBtc(formData.amount),
      btcInUsd,
    );

    const feeAmountBtc = maxDecimals(satoshiToBtc(formData.feeAmount), 8);
    const feeAmountUsd = calculateTokenValueInCurrency(
      satoshiToBtc(formData.feeAmount),
      btcInUsd,
    );

    const unbondingFeeBtc = maxDecimals(
      satoshiToBtc(stakingInfo.unbondingFeeSat),
      8,
    );
    const unbondingFeeUsd = calculateTokenValueInCurrency(
      satoshiToBtc(stakingInfo.unbondingFeeSat),
      btcInUsd,
    );

    return {
      stakeAmount: `${stakeAmountBtc} ${coinSymbol} (${stakeAmountUsd})`,
      feeRate: `${formData.feeRate} sat/vB`,
      transactionFees: `${feeAmountBtc} ${coinSymbol} (${feeAmountUsd})`,
      term: {
        blocks: `${formData.term} blocks`,
        duration: `~ ${blocksToDisplayTime(formData.term)}`,
      },
      onDemandBonding: `Enabled (~ ${unbondingTime} unbonding time)`,
      unbondingFee: `${unbondingFeeBtc} ${coinSymbol} (${unbondingFeeUsd})`,
    };
  }, [formData, stakingInfo, networkInfo, btcInUsd, coinSymbol]);

  if (!step) return null;

  return (
    <>
      {step === "preview" && stakingInfo && details && (
        <MultistakingPreviewModal
          open
          processing={processing}
          bsns={bsnInfos}
          finalityProviders={finalityProviderInfos}
          details={details}
          onClose={resetState}
          onProceed={async () => {
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
