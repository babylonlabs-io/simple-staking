import { type PropsWithChildren, useCallback, useMemo, useState } from "react";
import { useLocalStorage } from "usehooks-ts";
import { number, object, ObjectSchema, string } from "yup";

import { validateDecimalPoints } from "@/app/components/Staking/Form/validation/validation";
import { useBTCWallet } from "@/app/context/wallet/BTCWalletProvider";
import { useNetworkFees } from "@/app/hooks/client/api/useNetworkFees";
import { useHealthCheck } from "@/app/hooks/useHealthCheck";
import { useAppState } from "@/app/state";
import type { DelegationV2 } from "@/app/types/delegationsV2";
import { IS_FIXED_TERM_FIELD } from "@/config";
import { getNetworkConfigBTC } from "@/config/network/btc";
import { btcToSatoshi, satoshiToBtc } from "@/utils/btc";
import { createStateUtils } from "@/utils/createStateUtils";
import { getFeeRateFromMempool } from "@/utils/getFeeRateFromMempool";

import { useBalanceState } from "./BalanceState";

const formatStakingAmount = (value: number) =>
  !Number.isNaN(value) ? btcToSatoshi(value) : undefined;
const formatNumber = (value: number) =>
  !Number.isNaN(value) ? value : undefined;

const { coinName } = getNetworkConfigBTC();

export interface FormFields {
  finalityProvider: string;
  amount: number;
  term: number;
  feeRate: number;
  feeAmount: number;
}

export enum StakingStep {
  PREVIEW = "preview",
  EOI_STAKING_SLASHING = "eoi-staking-slashing",
  EOI_UNBONDING_SLASHING = "eoi-unbonding-slashing",
  EOI_PROOF_OF_POSSESSION = "eoi-proof-of-possession",
  EOI_SIGN_BBN = "eoi-sign-bbn",
  EOI_SEND_BBN = "eoi-send-bbn",
  VERIFYING = "verifying",
  VERIFIED = "verified",
  FEEDBACK_SUCCESS = "feedback-success",
  FEEDBACK_CANCEL = "feedback-cancel",
}

export interface StakingState {
  hasError: boolean;
  blocked: boolean;
  available: boolean;
  loading: boolean;
  processing: boolean;
  errorMessage?: string;
  validationSchema?: ObjectSchema<FormFields>;
  stakingInfo?: {
    minFeeRate: number;
    maxFeeRate: number;
    defaultFeeRate: number;
    minStakingTimeBlocks: number;
    maxStakingTimeBlocks: number;
    defaultStakingTimeBlocks?: number;
    minStakingAmountSat: number;
    maxStakingAmountSat: number;
    unbondingFeeSat: number;
    unbondingTime: number;
  };
  formData?: FormFields;
  step?: StakingStep;
  verifiedDelegation?: DelegationV2;
  goToStep: (name: StakingStep) => void;
  setProcessing: (value: boolean) => void;
  setFormData: (formData?: FormFields) => void;
  setVerifiedDelegation: (value?: DelegationV2) => void;
  reset: () => void;
}

const { StateProvider, useState: useStakingState } =
  createStateUtils<StakingState>({
    hasError: false,
    blocked: false,
    available: false,
    loading: false,
    processing: false,
    errorMessage: "",
    stakingInfo: {
      minFeeRate: 0,
      maxFeeRate: 0,
      defaultFeeRate: 0,
      minStakingAmountSat: 0,
      maxStakingAmountSat: 0,
      minStakingTimeBlocks: 0,
      maxStakingTimeBlocks: 0,
      unbondingFeeSat: 0,
      unbondingTime: 0,
    },
    formData: {
      finalityProvider: "",
      term: 0,
      amount: 0,
      feeRate: 0,
      feeAmount: 0,
    },
    step: undefined,
    verifiedDelegation: undefined,
    setVerifiedDelegation: () => {},
    goToStep: () => {},
    setFormData: () => {},
    setProcessing: () => {},
    reset: () => {},
  });

export function StakingState({ children }: PropsWithChildren) {
  const [currentStep, setCurrentStep] = useState<StakingStep>();
  const [formData, setFormData] = useState<FormFields>();
  const [processing, setProcessing] = useState(false);
  const [verifiedDelegation, setVerifiedDelegation] = useState<DelegationV2>();
  const [successModalShown, setSuccessModalShown] = useLocalStorage<boolean>(
    "bbn-staking-successFeedbackModalOpened",
    false,
  );
  const [cancelModalShown, setCancelModalShown] = useLocalStorage<boolean>(
    "bbn-staking-cancelFeedbackModalOpened ",
    false,
  );

  const {
    networkInfo,
    isError: isStateError,
    isLoading: isStateLoading,
  } = useAppState();
  const {
    isApiNormal,
    isGeoBlocked,
    apiMessage,
    isLoading: isCheckLoading,
  } = useHealthCheck();
  const {
    data: mempoolFeeRates,
    isError: isNetworkFeeError,
    isLoading: isFeeLoading,
  } = useNetworkFees();
  const { stakableBtcBalance, loading: isBalanceLoading } = useBalanceState();

  const { publicKeyNoCoord } = useBTCWallet();

  const loading =
    isStateLoading || isCheckLoading || isFeeLoading || isBalanceLoading;
  const hasError = isStateError || isNetworkFeeError || !isApiNormal;
  const blocked = isGeoBlocked;
  const available = Boolean(networkInfo?.stakingStatus.isStakingOpen);
  const errorMessage = apiMessage;
  const latestParam = networkInfo?.params.bbnStakingParams?.latestParam;

  const stakingInfo = useMemo(() => {
    if (!latestParam || !mempoolFeeRates) {
      return;
    }

    const {
      minStakingAmountSat = 0,
      maxStakingAmountSat = 0,
      minStakingTimeBlocks = 0,
      maxStakingTimeBlocks = 0,
      unbondingFeeSat,
      unbondingTime,
    } = latestParam || {};

    const { minFeeRate, defaultFeeRate, maxFeeRate } =
      getFeeRateFromMempool(mempoolFeeRates);
    const defaultStakingTimeBlocks =
      IS_FIXED_TERM_FIELD || minStakingTimeBlocks === maxStakingTimeBlocks
        ? maxStakingTimeBlocks
        : undefined;

    return {
      defaultFeeRate,
      minFeeRate,
      maxFeeRate,
      minStakingAmountSat,
      maxStakingAmountSat,
      minStakingTimeBlocks,
      maxStakingTimeBlocks,
      defaultStakingTimeBlocks,
      unbondingFeeSat,
      unbondingTime,
    };
  }, [latestParam, mempoolFeeRates]);

  const validationSchema = useMemo(
    () =>
      object()
        .shape({
          finalityProvider: string()
            .required("Please select a finality provider")
            .test(
              "same-public-key",
              "Cannot select a finality provider with the same public key as the wallet",
              (value) => value !== publicKeyNoCoord,
            ),

          term: number()
            .transform(formatNumber)
            .typeError("Staking term must be a valid number.")
            .required("Staking term is the required field.")
            .integer("Staking term must not have decimal points.")
            .moreThan(0, "Staking term must be greater than 0.")
            .min(
              stakingInfo?.minStakingTimeBlocks ?? 0,
              `Staking term must be at least ${stakingInfo?.minStakingTimeBlocks ?? 0} blocks.`,
            )
            .max(
              stakingInfo?.maxStakingTimeBlocks ?? 0,
              `Staking term must be no more than ${stakingInfo?.maxStakingTimeBlocks ?? 0} blocks.`,
            ),

          amount: number()
            .transform(formatStakingAmount)
            .typeError("Staking amount must be a valid number.")
            .required("Staking amount is the required field.")
            .moreThan(0, "Staking amount must be greater than 0.")
            .min(
              stakingInfo?.minStakingAmountSat ?? 0,
              `Staking amount must be at least ${satoshiToBtc(stakingInfo?.minStakingAmountSat ?? 0)} ${coinName}.`,
            )
            .max(
              stakingInfo?.maxStakingAmountSat ?? 0,
              `Staking amount must be no more than ${satoshiToBtc(stakingInfo?.maxStakingAmountSat ?? 0)} ${coinName}.`,
            )
            .max(
              stakableBtcBalance,
              `Staking amount exceeds your balance (${satoshiToBtc(stakableBtcBalance)} ${coinName})!`,
            )
            .test(
              "decimal-points",
              "Staking amount must have no more than 8 decimal points.",
              (_, context) => validateDecimalPoints(context.originalValue),
            ),

          feeRate: number()
            .transform(formatNumber)
            .typeError("Staking fee rate must be a valid number.")
            .required("Staking fee rate is the required field.")
            .moreThan(0, "Staking fee rate must be greater than 0.")
            .min(
              stakingInfo?.minFeeRate ?? 0,
              "Selected fee rate is lower than the hour fee",
            )
            .max(
              stakingInfo?.maxFeeRate ?? 0,
              "Selected fee rate is higher than the hour fee",
            )
            .min(
              stakingInfo?.defaultFeeRate ?? 0,
              "Fees are low, inclusion is not guaranteed",
            ),

          feeAmount: number()
            .transform(formatNumber)
            .typeError("Staking fee amount must be a valid number.")
            .required("Staking fee amount is the required field.")
            .moreThan(0, "Staking fee amount must be greater than 0."),
        })
        .required(),
    [publicKeyNoCoord, stakingInfo, stakableBtcBalance],
  );

  const goToStep = useCallback(
    (stepName: StakingStep) => {
      if (stepName === StakingStep.FEEDBACK_SUCCESS) {
        if (successModalShown) {
          return;
        } else {
          setSuccessModalShown(true);
        }
      }

      if (stepName === StakingStep.FEEDBACK_CANCEL) {
        if (cancelModalShown) {
          return;
        } else {
          setCancelModalShown(true);
        }
      }
      setCurrentStep(stepName);
    },
    [
      successModalShown,
      cancelModalShown,
      setCancelModalShown,
      setSuccessModalShown,
      setCurrentStep,
    ],
  );

  const reset = useCallback(() => {
    setVerifiedDelegation(undefined);
    setFormData(undefined);
    setCurrentStep(undefined);
    setProcessing(false);
  }, [setVerifiedDelegation, setFormData, setCurrentStep, setProcessing]);

  const context = useMemo(
    () => ({
      hasError,
      blocked,
      available,
      loading,
      processing,
      errorMessage,
      validationSchema,
      stakingInfo,
      formData,
      step: currentStep,
      verifiedDelegation,
      setVerifiedDelegation,
      setFormData,
      goToStep,
      setProcessing,
      reset,
    }),
    [
      hasError,
      blocked,
      available,
      loading,
      processing,
      errorMessage,
      validationSchema,
      stakingInfo,
      formData,
      currentStep,
      verifiedDelegation,
      setVerifiedDelegation,
      setFormData,
      goToStep,
      setProcessing,
      reset,
    ],
  );

  return <StateProvider value={context}>{children}</StateProvider>;
}

export { useStakingState };
