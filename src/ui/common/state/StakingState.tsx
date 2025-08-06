import type {
  RegistrationStep,
  SignPsbtOptions,
} from "@babylonlabs-io/btc-staking-ts";
import { EventData } from "@babylonlabs-io/btc-staking-ts";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import { useLocalStorage } from "usehooks-ts";
import { array, number, object, ObjectSchema, string } from "yup";

import { validateDecimalPoints } from "@/ui/common/components/Staking/Form/validation/validation";
import { getDisabledWallets, IS_FIXED_TERM_FIELD } from "@/ui/common/config";
import { getNetworkConfigBTC } from "@/ui/common/config/network/btc";
import {
  BaseStakingStep,
  EOIStep,
  STAKING_DISABLED,
} from "@/ui/common/constants";
import { useBTCWallet } from "@/ui/common/context/wallet/BTCWalletProvider";
import { useCosmosWallet } from "@/ui/common/context/wallet/CosmosWalletProvider";
import { useNetworkFees } from "@/ui/common/hooks/client/api/useNetworkFees";
import { useEventBus } from "@/ui/common/hooks/useEventBus";
import { useHealthCheck } from "@/ui/common/hooks/useHealthCheck";
import { useAppState } from "@/ui/common/state";
import type { DelegationV2 } from "@/ui/common/types/delegationsV2";
import { satoshiToBtc } from "@/ui/common/utils/btc";
import { createStateUtils } from "@/ui/common/utils/createStateUtils";
import {
  formatNumber,
  formatStakingAmount,
} from "@/ui/common/utils/formTransforms";
import { getFeeRateFromMempool } from "@/ui/common/utils/getFeeRateFromMempool";

import { useBalanceState } from "./BalanceState";

export enum StakingModalPage {
  DEFAULT,
  BSN,
  FINALITY_PROVIDER,
}

const { coinName } = getNetworkConfigBTC();

export interface FormFields {
  finalityProviders: string[];
  amount: number;
  term: number;
  feeRate: number;
  feeAmount: number;
}

export enum StakingStep {
  /** Base workflow steps - reuse shared base steps */
  PREVIEW = BaseStakingStep.PREVIEW,
  /** EOI signing steps - reuse shared EOI steps */
  EOI_STAKING_SLASHING = EOIStep.EOI_STAKING_SLASHING,
  EOI_UNBONDING_SLASHING = EOIStep.EOI_UNBONDING_SLASHING,
  EOI_PROOF_OF_POSSESSION = EOIStep.EOI_PROOF_OF_POSSESSION,
  EOI_SIGN_BBN = EOIStep.EOI_SIGN_BBN,
  EOI_SEND_BBN = EOIStep.EOI_SEND_BBN,
  /** Final steps */
  VERIFYING = BaseStakingStep.VERIFYING,
  VERIFIED = BaseStakingStep.VERIFIED,
  FEEDBACK_SUCCESS = BaseStakingStep.FEEDBACK_SUCCESS,
  FEEDBACK_CANCEL = BaseStakingStep.FEEDBACK_CANCEL,
}

export interface StakingState {
  hasError: boolean;
  blocked: boolean;
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
  stakingStepOptions: EventData | undefined;
  setStakingStepOptions?: (options?: EventData) => void;
}

export const STAKING_SIGNING_STEP_MAP: Record<RegistrationStep, StakingStep> = {
  "staking-slashing": StakingStep.EOI_STAKING_SLASHING,
  "unbonding-slashing": StakingStep.EOI_UNBONDING_SLASHING,
  "proof-of-possession": StakingStep.EOI_PROOF_OF_POSSESSION,
  "create-btc-delegation-msg": StakingStep.EOI_SIGN_BBN,
};

const { StateProvider, useState: useStakingState } =
  createStateUtils<StakingState>({
    hasError: false,
    blocked: false,
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
      finalityProviders: [],
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
    stakingStepOptions: undefined,
    setStakingStepOptions: () => {},
  });

export function StakingState({ children }: PropsWithChildren) {
  const [currentStep, setCurrentStep] = useState<StakingStep>();
  const [stakingStepOptions, setStakingStepOptions] = useState<EventData>();

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
          finalityProviders: array()
            .of(string().required())
            .required("Please select a finality provider")
            .min(1, "Please select at least one finality provider")
            .test(
              "no-duplicate-public-keys",
              "Cannot select a finality provider with the same public key as the wallet",
              (value) => !value?.includes(publicKeyNoCoord),
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
    setStakingStepOptions(undefined);
    setProcessing(false);
  }, [
    setVerifiedDelegation,
    setFormData,
    setCurrentStep,
    setProcessing,
    setStakingStepOptions,
  ]);

  useEffect(() => {
    const unsubscribe = eventBus.on("delegation:create", (options) => {
      const type = options?.type as RegistrationStep | undefined;

      if (type) {
        const stepName = STAKING_SIGNING_STEP_MAP[type];
        setCurrentStep(stepName);
        setStakingStepOptions(options);
      }
    });

    return unsubscribe;
  }, [eventBus, setCurrentStep, setStakingStepOptions]);

  const context = useMemo(
    () => ({
      hasError,
      blocked,
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
      stakingStepOptions,
      setStakingStepOptions,
    }),
    [
      hasError,
      blocked,
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
      stakingStepOptions,
      setStakingStepOptions,
    ],
  );

  return <StateProvider value={context}>{children}</StateProvider>;
}

export { useStakingState };
