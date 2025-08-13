import { Avatar, useFormContext, useWatch } from "@babylonlabs-io/core-ui";
import { useMemo } from "react";

import { CancelFeedbackModal } from "@/ui/common/components/Modals/CancelFeedbackModal";
import { PreviewMultistakingModal } from "@/ui/common/components/Modals/PreviewMultistakingModal";
import { SignModal } from "@/ui/common/components/Modals/SignModal/SignModal";
import { StakeModal } from "@/ui/common/components/Modals/StakeModal";
import { SuccessFeedbackModal } from "@/ui/common/components/Modals/SuccessFeedbackModal";
import { VerificationModal } from "@/ui/common/components/Modals/VerificationModal";
import { FinalityProviderLogo } from "@/ui/common/components/Staking/FinalityProviders/FinalityProviderLogo";
import { getNetworkConfigBBN } from "@/ui/common/config/network/bbn";
import { getNetworkConfigBTC } from "@/ui/common/config/network/btc";
import { chainLogos } from "@/ui/common/constants";
import { useNetworkInfo } from "@/ui/common/hooks/client/api/useNetworkInfo";
import { usePrice } from "@/ui/common/hooks/client/api/usePrices";
import { useStakingService } from "@/ui/common/hooks/services/useStakingService";
import { useFinalityProviderBsnState } from "@/ui/common/state/FinalityProviderBsnState";
import { useFinalityProviderState } from "@/ui/common/state/FinalityProviderState";
import { useStakingState } from "@/ui/common/state/StakingState";
import { BsnFpDisplayItem } from "@/ui/common/types/display";
import { satoshiToBtc } from "@/ui/common/utils/btc";
import { calculateTokenValueInCurrency } from "@/ui/common/utils/formatCurrency";
import { maxDecimals } from "@/ui/common/utils/maxDecimals";
import { blocksToDisplayTime } from "@/ui/common/utils/time";
import { trim } from "@/ui/common/utils/trim";

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

const { chainId: BBN_CHAIN_ID } = getNetworkConfigBBN();
const { displayUSD } = getNetworkConfigBTC();

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

  const currentFinalityProviders = useWatch({ name: "finalityProviders" });

  const { bsnInfos, finalityProviderInfos } = useMemo(() => {
    const bsns: BsnFpDisplayItem[] = [];
    const fps: BsnFpDisplayItem[] = [];

    if (currentFinalityProviders) {
      if (
        typeof currentFinalityProviders === "object" &&
        !Array.isArray(currentFinalityProviders)
      ) {
        const providerMap = currentFinalityProviders as Record<string, string>;

        Object.entries(providerMap).forEach(([bsnId, fpPublicKey]) => {
          const bsn = bsnList.find((bsn) => bsn.id === bsnId);
          if (bsn || bsnId === BBN_CHAIN_ID) {
            const logoUrl =
              chainLogos[bsn?.id || "babylon"] || chainLogos.placeholder;
            bsns.push({
              icon: (
                <Avatar
                  url={logoUrl}
                  alt={bsn?.name || "Babylon Genesis"}
                  variant="rounded"
                  size="tiny"
                />
              ),
              name: bsn?.name || "Babylon Genesis",
              isExisting: false,
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
                  size="sm"
                />
              ),
              name: provider.description?.moniker || trim(fpPublicKey, 8),
              isExisting: false,
            });
          }
        });
      } else {
        const fpArray = Array.isArray(currentFinalityProviders)
          ? currentFinalityProviders
          : [];

        fpArray.forEach((fpPublicKey) => {
          const logoUrl = chainLogos["babylon"];
          bsns.push({
            icon: (
              <Avatar
                url={logoUrl}
                alt={"Babylon Genesis"}
                variant="rounded"
                size="tiny"
              />
            ),
            name: "Babylon Genesis",
            isExisting: false,
          });

          const provider = getRegisteredFinalityProvider(fpPublicKey);
          if (provider) {
            fps.push({
              icon: (
                <FinalityProviderLogo
                  logoUrl={provider.logo_url}
                  rank={provider.rank}
                  moniker={provider.description?.moniker}
                  size="sm"
                />
              ),
              name: provider.description?.moniker || trim(fpPublicKey, 8),
              isExisting: false,
            });
          }
        });
      }
    }

    return { bsnInfos: bsns, finalityProviderInfos: fps };
  }, [currentFinalityProviders, bsnList, getRegisteredFinalityProvider]);

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
      stakeAmount: `${stakeAmountBtc} ${coinSymbol}${displayUSD ? ` (${stakeAmountUsd})` : ""}`,
      feeRate: `${formData.feeRate} sat/vB`,
      transactionFees: `${feeAmountBtc} ${coinSymbol}${displayUSD ? ` (${feeAmountUsd})` : ""}`,
      term: {
        blocks: `${formData.term} blocks`,
        duration: `~ ${blocksToDisplayTime(formData.term)}`,
      },
      unbonding: `~ ${unbondingTime}`,
      unbondingFee: `${unbondingFeeBtc} ${coinSymbol}${displayUSD ? ` (${unbondingFeeUsd})` : ""}`,
    };
  }, [formData, stakingInfo, networkInfo, btcInUsd, coinSymbol]);

  if (!step) return null;

  return (
    <>
      {step === "preview" && stakingInfo && details && (
        <PreviewMultistakingModal
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
