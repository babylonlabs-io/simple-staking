import { SignPsbtOptions } from "@babylonlabs-io/wallet-connector";
import { useCallback, useMemo, useState, type PropsWithChildren } from "react";
import { number, object, ObjectSchema, string } from "yup";

import { validateDecimalPoints } from "@/app/components/Staking/Form/validation/validation";
import { getNetworkConfigBTC } from "@/app/config/network/btc";
import { useBTCWallet } from "@/app/context/wallet/BTCWalletProvider";
import { useAppState } from "@/app/state";
import { satoshiToBtc } from "@/app/utils/btc";
import { createStateUtils } from "@/app/utils/createStateUtils";
import { formatNumber, formatStakingAmount } from "@/app/utils/formTransforms";

import type { FinalityProvider } from "../types/finalityProviders";

import { useBalanceState } from "./BalanceState";
import { useFinalityProviderState } from "./FinalityProviderState";
import { StakingModalPage } from "./StakingState";

const { coinName } = getNetworkConfigBTC();

export interface MultistakingFormFields {
  finalityProvider: string;
  amount: number;
  term: number;
  feeRate: number;
  feeAmount: number;
}

export interface MultistakingState {
  isModalOpen: boolean;
  setIsModalOpen: (value: boolean) => void;
  stakingModalPage: StakingModalPage;
  setStakingModalPage: (page: StakingModalPage) => void;
  selectedProviders: (FinalityProvider & { chainType: string })[];
  handleSelectProvider: (selectedProviderKey: string) => void;
  removeProvider: (providerId: string) => void;
  selectedChain: string;
  setSelectedChain: (chain: string) => void;
  MAX_FINALITY_PROVIDERS: number;
  currentStakingStepOptions: SignPsbtOptions | undefined;
  setCurrentStakingStepOptions: (options?: SignPsbtOptions) => void;
  validationSchema?: ObjectSchema<MultistakingFormFields>;
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
}

const { StateProvider, useState: useMultistakingState } =
  createStateUtils<MultistakingState>({
    isModalOpen: false,
    setIsModalOpen: () => {},
    stakingModalPage: StakingModalPage.FINALITY_PROVIDER,
    setStakingModalPage: () => {},
    selectedProviders: [],
    handleSelectProvider: () => {},
    removeProvider: () => {},
    selectedChain: "babylon",
    setSelectedChain: () => {},
    MAX_FINALITY_PROVIDERS: 1,
    currentStakingStepOptions: undefined,
    setCurrentStakingStepOptions: () => {},
    validationSchema: undefined,
    stakingInfo: undefined,
  });

export function MultistakingState({ children }: PropsWithChildren) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [stakingModalPage, setStakingModalPage] = useState<StakingModalPage>(
    StakingModalPage.FINALITY_PROVIDER,
  );
  const [selectedChain, setSelectedChain] = useState("babylon");
  const [selectedProviders, setSelectedProviders] = useState<
    (FinalityProvider & { chainType: string })[]
  >([]);
  const [currentStakingStepOptions, setCurrentStakingStepOptions] =
    useState<SignPsbtOptions>();

  const MAX_FINALITY_PROVIDERS = 1;

  const { finalityProviders } = useFinalityProviderState();
  const { publicKeyNoCoord } = useBTCWallet();
  const { stakableBtcBalance } = useBalanceState();
  const { networkInfo } = useAppState();

  const latestParam = networkInfo?.params.bbnStakingParams?.latestParam;

  const stakingInfo = useMemo(() => {
    if (!latestParam) {
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

    // Default fee rates for multistaking
    const minFeeRate = 1;
    const maxFeeRate = 1000;
    const defaultFeeRate = 10;

    return {
      defaultFeeRate,
      minFeeRate,
      maxFeeRate,
      minStakingAmountSat,
      maxStakingAmountSat,
      minStakingTimeBlocks,
      maxStakingTimeBlocks,
      unbondingFeeSat,
      unbondingTime,
    };
  }, [latestParam]);

  const validationSchema = useMemo(
    () =>
      object()
        .shape({
          finalityProvider: string()
            .required("Add Finality Provider")
            .test(
              "same-public-key",
              "Cannot select a finality provider with the same public key as the wallet",
              function (value) {
                if (value === publicKeyNoCoord) {
                  return this.createError({
                    message:
                      "Cannot select a finality provider with the same public key as the wallet",
                    type: "critical",
                  });
                }
                return true;
              },
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
            .required("Enter BTC Amount to Stake")
            .moreThan(0, "Staking amount must be greater than 0.")
            .min(
              stakingInfo?.minStakingAmountSat ?? 0,
              `Staking amount must be at least ${satoshiToBtc(stakingInfo?.minStakingAmountSat ?? 0)} ${coinName}.`,
            )
            .max(
              stakingInfo?.maxStakingAmountSat ?? 0,
              `Staking amount must be no more than ${satoshiToBtc(stakingInfo?.maxStakingAmountSat ?? 0)} ${coinName}.`,
            )
            .test(
              "balance-check",
              "Staking Amount Exceeds Balance",
              (value) => {
                if (!value) return true;
                return value <= stakableBtcBalance;
              },
            )
            .test(
              "decimal-points",
              "Staking amount must have no more than 8 decimal points.",
              function (_, context) {
                if (!validateDecimalPoints(context.originalValue)) {
                  return this.createError({
                    message:
                      "Staking amount must have no more than 8 decimal points.",
                    type: "critical",
                  });
                }
                return true;
              },
            )
            .test("insufficient-funds", "Insufficient BTC", () => true),

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

  const handleSelectProvider = useCallback(
    (selectedProviderKey: string) => {
      if (selectedProviderKey) {
        const providerData = finalityProviders?.find(
          (p) => p.btcPk === selectedProviderKey,
        );
        if (providerData) {
          setSelectedProviders((prev) => [
            ...prev,
            { ...providerData, chainType: selectedChain },
          ]);
        }
      }
      setIsModalOpen(false);
    },
    [finalityProviders, selectedChain],
  );

  const removeProvider = useCallback((providerId: string) => {
    setSelectedProviders((prev) => prev.filter((p) => p.id !== providerId));
  }, []);

  const context = useMemo(
    () => ({
      isModalOpen,
      setIsModalOpen,
      stakingModalPage,
      setStakingModalPage,
      selectedProviders,
      handleSelectProvider,
      removeProvider,
      selectedChain,
      setSelectedChain,
      MAX_FINALITY_PROVIDERS,
      currentStakingStepOptions,
      setCurrentStakingStepOptions,
      validationSchema,
      stakingInfo,
    }),
    [
      isModalOpen,
      setIsModalOpen,
      stakingModalPage,
      setStakingModalPage,
      selectedProviders,
      handleSelectProvider,
      removeProvider,
      selectedChain,
      setSelectedChain,
      MAX_FINALITY_PROVIDERS,
      currentStakingStepOptions,
      setCurrentStakingStepOptions,
      validationSchema,
      stakingInfo,
    ],
  );

  return <StateProvider value={context}>{children}</StateProvider>;
}

export { useMultistakingState };
