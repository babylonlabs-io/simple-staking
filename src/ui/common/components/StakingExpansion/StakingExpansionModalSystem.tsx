import { Avatar, PreviewModal, useFormContext } from "@babylonlabs-io/core-ui";
import { useMemo } from "react";

import { CancelFeedbackModal } from "@/ui/common/components/Modals/CancelFeedbackModal";
import { SignModal } from "@/ui/common/components/Modals/SignModal/SignModal";
import { StakeModal } from "@/ui/common/components/Modals/StakeModal";
import { SuccessFeedbackModal } from "@/ui/common/components/Modals/SuccessFeedbackModal";
import { VerificationModal } from "@/ui/common/components/Modals/VerificationModal";
import { FinalityProviderLogo } from "@/ui/common/components/Staking/FinalityProviders/FinalityProviderLogo";
import { getNetworkConfigBBN } from "@/ui/common/config/network/bbn";
import { getNetworkConfigBTC } from "@/ui/common/config/network/btc";
import {
  BaseStakingStep,
  DEFAULT_CONFIRMATION_DEPTH,
  EOIStep,
} from "@/ui/common/constants";
import { useNetworkInfo } from "@/ui/common/hooks/client/api/useNetworkInfo";
import { usePrice } from "@/ui/common/hooks/client/api/usePrices";
import { useStakingExpansionService } from "@/ui/common/hooks/services/useStakingExpansionService";
import { useDelegationV2State } from "@/ui/common/state/DelegationV2State";
import {
  FinalityProviderBsnState,
  useFinalityProviderBsnState,
} from "@/ui/common/state/FinalityProviderBsnState";
import { useFinalityProviderState } from "@/ui/common/state/FinalityProviderState";
import { useStakingExpansionState } from "@/ui/common/state/StakingExpansionState";
import { StakingExpansionStep } from "@/ui/common/state/StakingExpansionTypes";
import { BsnFpDisplayItem } from "@/ui/common/types/display";
import { satoshiToBtc } from "@/ui/common/utils/btc";
import { calculateTokenValueInCurrency } from "@/ui/common/utils/formatCurrency";
import { maxDecimals } from "@/ui/common/utils/maxDecimals";
import { blocksToDisplayTime } from "@/ui/common/utils/time";
import { trim } from "@/ui/common/utils/trim";

import { SignDetailsModal } from "../Modals/SignDetailsModal";

import { RenewTimelockModal } from "./RenewTimelockModal";
import { StakingExpansionModal } from "./StakingExpansionModal";
import { VerifiedStakeExpansionModal } from "./VerifiedStakeExpansionModal";

const EOI_STEP_INDEXES: Record<string, number> = {
  [EOIStep.EOI_STAKING_SLASHING]: 1,
  [EOIStep.EOI_UNBONDING_SLASHING]: 2,
  [EOIStep.EOI_PROOF_OF_POSSESSION]: 3,
  [EOIStep.EOI_SIGN_BBN]: 4,
};

const VERIFICATION_STEP_INDEXES: Record<string, 1 | 2> = {
  [EOIStep.EOI_SEND_BBN]: 1,
  [BaseStakingStep.VERIFYING]: 2,
};

const { chainId: BBN_CHAIN_ID } = getNetworkConfigBBN();
const { coinSymbol, displayUSD } = getNetworkConfigBTC();

function StakingExpansionModalSystemInner() {
  const {
    processing,
    step,
    formData,
    verifiedDelegation,
    reset: resetState,
    expansionStepOptions,
    verifiedExpansionModalOpen,
    setVerifiedExpansionModalOpen,
  } = useStakingExpansionState();

  const { getRegisteredFinalityProvider } = useFinalityProviderState();
  const { bsnList } = useFinalityProviderBsnState();
  const { createExpansionEOI, stakeDelegationExpansion } =
    useStakingExpansionService();
  const { reset: resetForm, trigger: revalidateForm } = useFormContext() || {
    reset: () => {},
    trigger: () => {},
  };
  const { data: networkInfoData } = useNetworkInfo();
  const btcInUsd = usePrice(coinSymbol);

  const { delegationV2StepOptions, setDelegationV2StepOptions } =
    useDelegationV2State();
  const detailsModalTitle =
    (delegationV2StepOptions?.type as string) ||
    "Expansion Transaction Details";

  // Prepare BSN and FP info arrays for preview modal
  const { bsnInfos, finalityProviderInfos, details } = useMemo(() => {
    if (!formData) {
      return { bsnInfos: [], finalityProviderInfos: [], details: null };
    }

    const existingBsns: BsnFpDisplayItem[] = [];
    const existingFps: BsnFpDisplayItem[] = [];
    const newBsns: BsnFpDisplayItem[] = [];
    const newFps: BsnFpDisplayItem[] = [];

    // Process existing BSN+FP pairs from original delegation
    if (formData.originalDelegation?.finalityProviderBtcPksHex) {
      const existingFpArray = Array.isArray(
        formData.originalDelegation.finalityProviderBtcPksHex,
      )
        ? formData.originalDelegation.finalityProviderBtcPksHex
        : [];

      existingFpArray.forEach((fpPkHex) => {
        const provider = getRegisteredFinalityProvider(fpPkHex);
        if (provider) {
          // Determine BSN for this FP
          const bsnId = provider.bsnId || BBN_CHAIN_ID;
          const bsn = bsnList.find((b) => b.id === bsnId);

          existingBsns.push({
            icon: (
              <Avatar
                url={bsn?.logoUrl}
                alt={bsn?.name || "Babylon Genesis"}
                variant="rounded"
                size="tiny"
              />
            ),
            name: bsn?.name || "Babylon Genesis",
            isExisting: true,
          });

          existingFps.push({
            icon: (
              <FinalityProviderLogo
                logoUrl={provider.logo_url}
                rank={provider.rank}
                moniker={provider.description?.moniker}
                size="sm"
              />
            ),
            name: provider.description?.moniker || trim(fpPkHex, 8),
            isExisting: true,
          });
        }
      });
    }

    // Process new BSN+FP pairs from selectedBsnFps
    Object.entries(formData.selectedBsnFps).forEach(([bsnId, fpPkHex]) => {
      const bsn = bsnList.find((b) => b.id === bsnId);
      const provider = getRegisteredFinalityProvider(fpPkHex);

      if (bsn || bsnId === BBN_CHAIN_ID) {
        newBsns.push({
          icon: (
            <Avatar
              url={bsn?.logoUrl}
              alt={bsn?.name || "Babylon Genesis"}
              variant="rounded"
              size="tiny"
            />
          ),
          name: bsn?.name || "Babylon Genesis",
          isExisting: false,
        });
      }

      if (provider) {
        newFps.push({
          icon: (
            <FinalityProviderLogo
              logoUrl={provider.logo_url}
              rank={provider.rank}
              moniker={provider.description?.moniker}
              size="sm"
            />
          ),
          name: provider.description?.moniker || trim(fpPkHex, 8),
          isExisting: false,
        });
      }
    });

    // Combine existing and new arrays
    const allBsns = [...existingBsns, ...newBsns];
    const allFps = [...existingFps, ...newFps];

    // Prepare details object
    const unbondingTime =
      blocksToDisplayTime(
        networkInfoData?.params.bbnStakingParams?.latestParam?.unbondingTime,
      ) || "7 days";
    const unbondingFeeSat =
      networkInfoData?.params.bbnStakingParams?.latestParam?.unbondingFeeSat ||
      0;

    const stakeAmountBtc = maxDecimals(
      satoshiToBtc(formData.originalDelegation.stakingAmount),
      8,
    );
    const stakeAmountUsd = calculateTokenValueInCurrency(
      satoshiToBtc(formData.originalDelegation.stakingAmount),
      btcInUsd,
    );

    const feeAmountBtc = maxDecimals(satoshiToBtc(formData.feeAmount || 0), 8);
    const feeAmountUsd = calculateTokenValueInCurrency(
      satoshiToBtc(formData.feeAmount || 0),
      btcInUsd,
    );

    const unbondingFeeBtc = maxDecimals(satoshiToBtc(unbondingFeeSat), 8);
    const unbondingFeeUsd = calculateTokenValueInCurrency(
      satoshiToBtc(unbondingFeeSat),
      btcInUsd,
    );

    const detailsObj = {
      stakeAmount: `${stakeAmountBtc} ${coinSymbol}${displayUSD ? ` (${stakeAmountUsd})` : ""}`,
      feeRate: `${formData.feeRate} sat/vB`,
      transactionFees: `${feeAmountBtc} ${coinSymbol}${displayUSD ? ` (${feeAmountUsd})` : ""}`,
      term: {
        blocks: `${formData.stakingTimelock} blocks`,
        duration: `~ ${blocksToDisplayTime(formData.stakingTimelock)}`,
      },
      unbonding: `~ ${unbondingTime}`,
      unbondingFee: `${unbondingFeeBtc} ${coinSymbol}${displayUSD ? ` (${unbondingFeeUsd})` : ""}`,
    };

    return {
      bsnInfos: allBsns,
      finalityProviderInfos: allFps,
      details: detailsObj,
    };
  }, [
    formData,
    getRegisteredFinalityProvider,
    bsnList,
    networkInfoData,
    btcInUsd,
  ]);

  const handleClose = () => {
    resetState();
    setDelegationV2StepOptions?.(undefined);
  };

  const handleCloseVerifiedModal = () => {
    setVerifiedExpansionModalOpen(false);
  };

  return (
    <>
      {/* Step-based modals - only render when there's an active step */}
      {step && (
        <>
          {step === StakingExpansionStep.BSN_FP_SELECTION && (
            <StakingExpansionModal open onClose={handleClose} />
          )}
          {step === StakingExpansionStep.RENEWAL_TIMELOCK && (
            <RenewTimelockModal open onClose={handleClose} />
          )}
          {step === StakingExpansionStep.PREVIEW && formData && details && (
            <PreviewModal
              open
              processing={processing}
              bsns={bsnInfos}
              finalityProviders={finalityProviderInfos}
              details={details}
              onClose={handleClose}
              onProceed={async () => {
                await createExpansionEOI(formData);
                resetForm();
                revalidateForm();
              }}
              warnings={[
                `1. No third party possesses your staked ${coinSymbol}. You are the only one who can unbond and withdraw your stake.`,
                `2. Your stake will first be sent to Babylon Genesis for verification (~20 seconds), then you will be prompted to submit it to the Bitcoin ledger. It will be marked as 'Pending' until it receives ${networkInfoData?.params?.btcEpochCheckParams?.latestParam?.btcConfirmationDepth ?? DEFAULT_CONFIRMATION_DEPTH} Bitcoin confirmations.`,
                "3. Please note: submitting this transaction will reset your stake's timelock.",
              ]}
            />
          )}
          {Boolean(EOI_STEP_INDEXES[step]) && (
            <SignModal
              open
              processing={processing}
              step={EOI_STEP_INDEXES[step]}
              title="Staking Expansion"
              options={expansionStepOptions}
            />
          )}
          {Boolean(VERIFICATION_STEP_INDEXES[step]) && (
            <VerificationModal
              open
              processing={processing}
              step={VERIFICATION_STEP_INDEXES[step]}
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
      )}

      {/* Independent modals - render regardless of step */}
      <VerifiedStakeExpansionModal
        open={verifiedExpansionModalOpen}
        onClose={handleCloseVerifiedModal}
        processing={processing}
      />
    </>
  );
}

export function StakingExpansionModalSystem() {
  return (
    <FinalityProviderBsnState>
      <StakingExpansionModalSystemInner />
    </FinalityProviderBsnState>
  );
}
