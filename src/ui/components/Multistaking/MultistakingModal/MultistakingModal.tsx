import { useFormContext } from "@babylonlabs-io/core-ui";
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
import { useStakingService } from "@/ui/hooks/services/useStakingService";
import { useFinalityProviderBsnState } from "@/ui/state/FinalityProviderBsnState";
import { useStakingState } from "@/ui/state/StakingState";
import { satoshiToBtc } from "@/ui/utils/btc";
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
  } = useStakingState();

  const { bsnList, finalityProviderMap } = useFinalityProviderBsnState();

  const { createEOI, stakeDelegation } = useStakingService();

  const {
    reset: resetForm,
    trigger: revalidateForm,
    setValue: setFieldValue,
  } = useFormContext();

  const finalityProviderInfos = useMemo(() => {
    return (formData?.finalityProviders ?? [])
      .map((pk) => {
        const provider = finalityProviderMap.get(pk);
        if (!provider) return null;
        return {
          name: provider.description?.moniker || trim(pk, 8),
          icon: (
            <FinalityProviderLogo
              logoUrl={provider.logo_url}
              rank={provider.rank}
              moniker={provider.description?.moniker}
              className="w-8 h-8"
            />
          ),
        };
      })
      .filter(Boolean) as { name: string; icon: React.ReactNode | undefined }[];
  }, [formData?.finalityProviders, finalityProviderMap]);

  const bsnInfos = useMemo(() => {
    const bsnMap = new Map<string, { name: string; id: string }>();

    (formData?.finalityProviders ?? []).forEach((pk) => {
      const provider = finalityProviderMap.get(pk);
      if (!provider) return;

      const bsnId = (provider as any).bsnId || "";

      const defaultBsnName = "Babylon Genesis";
      const defaultBsnId = "babylon";

      if (bsnId && !bsnMap.has(bsnId)) {
        const bsnName =
          bsnList.find((b) => b.id === bsnId)?.name || trim(bsnId, 8);
        bsnMap.set(bsnId, { name: bsnName, id: bsnId });
      } else if (!bsnId && !bsnMap.has("babylon")) {
        bsnMap.set("babylon", { name: defaultBsnName, id: defaultBsnId });
      }
    });

    return Array.from(bsnMap.values()).map(({ name, id }) => ({
      name,
      icon: (
        <img
          src={chainLogos[id] || chainLogos.placeholder}
          alt={name}
          className="w-8 h-8 rounded-full"
        />
      ),
    })) as { name: string; icon: React.ReactNode | undefined }[];
  }, [formData?.finalityProviders, finalityProviderMap, bsnList]);

  const { coinSymbol } = getNetworkConfigBTC();

  if (!step) return null;

  console.log({ finalityProviderInfos });

  return (
    <>
      {step === "preview" && stakingInfo && (
        <MultistakingPreviewModal
          open
          processing={processing}
          bsns={bsnInfos}
          finalityProviders={finalityProviderInfos}
          details={{
            stakeAmount: `${maxDecimals(satoshiToBtc(formData?.amount ?? 0), 8)} ${coinSymbol}`,
            feeRate: `${formData?.feeRate ?? 0} sat/vB`,
            transactionFees: `${maxDecimals(satoshiToBtc(formData?.feeAmount ?? 0), 8)} ${coinSymbol}`,
            term: {
              blocks: `${formData?.term ?? 0} blocks`,
              duration: `~ ${blocksToDisplayTime(formData?.term ?? 0)}`,
            },
            onDemandBonding: `Enabled (~ ${blocksToDisplayTime(stakingInfo.unbondingTime)} unbonding time)`,
            unbondingFee: `${maxDecimals(satoshiToBtc(stakingInfo.unbondingFeeSat), 8)} ${coinSymbol}`,
          }}
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
