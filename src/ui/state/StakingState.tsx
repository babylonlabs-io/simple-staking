import type {
  RegistrationStep,
  SignPsbtOptions,
} from "@babylonlabs-io/btc-staking-ts";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import { useLocalStorage } from "usehooks-ts";
import { number, object, ObjectSchema, string } from "yup";

import { validateDecimalPoints } from "@/ui/components/Staking/Form/validation/validation";
import { getDisabledWallets, IS_FIXED_TERM_FIELD } from "@/ui/config";
import { getNetworkConfigBTC } from "@/ui/config/network/btc";
import { useBTCWallet } from "@/ui/context/wallet/BTCWalletProvider";
import { useNetworkFees } from "@/ui/hooks/client/api/useNetworkFees";
import { useEventBus } from "@/ui/hooks/useEventBus";
import { useHealthCheck } from "@/ui/hooks/useHealthCheck";
import { useAppState } from "@/ui/state";
import type { DelegationV2 } from "@/ui/types/delegationsV2";
import { satoshiToBtc } from "@/ui/utils/btc";
import { createStateUtils } from "@/ui/utils/createStateUtils";
import { formatNumber, formatStakingAmount } from "@/ui/utils/formTransforms";
import { getFeeRateFromMempool } from "@/ui/utils/getFeeRateFromMempool";

import { STAKING_DISABLED } from "../constants";
import { useCosmosWallet } from "../context/wallet/CosmosWalletProvider";

import { useBalanceState } from "./BalanceState";

export enum StakingModalPage {
  DEFAULT = 0,
  CHAIN_SELECTION = 1,
  FINALITY_PROVIDER = 2,
}

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
  goToStep: (name: StakingStep, options?: SignPsbtOptions) => void;
  setProcessing: (value: boolean) => void;
  setFormData: (formData?: FormFields) => void;
  setVerifiedDelegation: (value?: DelegationV2) => void;
  reset: () => void;
  disabled?: {
    title: string;
    message: string;
  };
  currentStakingStepOptions: SignPsbtOptions | undefined;
}

const STAKING_SIGNING_STEP_MAP: Record<RegistrationStep, StakingStep> = {
  "staking-slashing": StakingStep.EOI_STAKING_SLASHING,
  "unbonding-slashing": StakingStep.EOI_UNBONDING_SLASHING,
  "proof-of-possession": StakingStep.EOI_PROOF_OF_POSSESSION,
  "create-btc-delegation-msg": StakingStep.EOI_SIGN_BBN,
};

const { StateProvider, useState: useStakingState } =
  createStateUtils<StakingState>({
    hasError: false,
    blocked: false,
    available: false,
    disabled: undefined,
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
    currentStakingStepOptions: undefined,
  });

export function StakingState({ children }: PropsWithChildren) {
  const [currentStep, setCurrentStep] = useState<StakingStep>();
  const [currentStakingStepOptions, setCurrentStakingStepOptions] =
    useState<SignPsbtOptions>();

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
  const eventBus = useEventBus();

  const {
    networkInfo,
    isError: isStateError,
    isLoading: isStateLoading,
  } = useAppState();
  const {
    isApiNormal,
    isGeoBlocked,
    isLoading: isCheckLoading,
    error: healthCheckError,
  } = useHealthCheck();
  const {
    data: mempoolFeeRates,
    isError: isNetworkFeeError,
    isLoading: isFeeLoading,
  } = useNetworkFees();
  const { stakableBtcBalance, loading: isBalanceLoading } = useBalanceState();

  const { publicKeyNoCoord } = useBTCWallet();
  const { walletName: cosmosWalletName } = useCosmosWallet();

  const loading =
    isStateLoading || isCheckLoading || isFeeLoading || isBalanceLoading;
  const hasError = isStateError || isNetworkFeeError || !isApiNormal;
  const blocked = isGeoBlocked;
  const available = Boolean(networkInfo?.stakingStatus.isStakingOpen);
  const errorMessage = healthCheckError?.message;
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

  const isDisabled = useMemo(() => {
    // System wide staking disabled
    if (STAKING_DISABLED) {
      return {
        title: "Staking Currently Unavailable",
        message:
          "Staking is temporarily disabled due to network downtime. New stakes are paused until the network resumes.",
      };
    }
    // Disable wallet by their name in the event of incident
    // TODO: Add support for BTC wallet in the future
    if (
      cosmosWalletName != "" &&
      getDisabledWallets().includes(cosmosWalletName)
    ) {
      return {
        title: `Staking registration is temporarily disabled for ${cosmosWalletName} wallet.`,
        message: "Please try again later.",
      };
    }

    // If the staking is not disabled, return undefined
    return undefined;
  }, [cosmosWalletName]);

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
    setCurrentStakingStepOptions(undefined);
    setProcessing(false);
  }, [
    setVerifiedDelegation,
    setFormData,
    setCurrentStep,
    setProcessing,
    setCurrentStakingStepOptions,
  ]);

  useEffect(() => {
    const unsubscribe = eventBus.on("delegation:create", (step, options) => {
      const stepName = STAKING_SIGNING_STEP_MAP[step];

      if (stepName) {
        setCurrentStep(stepName);
        setCurrentStakingStepOptions(options);
      }
    });

    return unsubscribe;
  }, [eventBus, setCurrentStep, setCurrentStakingStepOptions]);

  const context = useMemo(
    () => ({
      hasError,
      blocked,
      available,
      disabled: isDisabled,
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
      currentStakingStepOptions,
    }),
    [
      hasError,
      blocked,
      available,
      isDisabled,
      loading,
      processing,
      errorMessage,
      validationSchema,
      stakingInfo,
      formData,
      currentStep,
      verifiedDelegation,
      goToStep,
      setProcessing,
      reset,
      currentStakingStepOptions,
    ],
  );

  return <StateProvider value={context}>{children}</StateProvider>;
}

export { useStakingState };
