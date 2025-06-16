import { SignPsbtOptions } from "@babylonlabs-io/wallet-connector";
import { useCallback, useMemo, useState, type PropsWithChildren } from "react";
import { number, object, ObjectSchema, ObjectShape, Schema, string } from "yup";

import { validateDecimalPoints } from "@/ui/components/Staking/Form/validation/validation";
import { getNetworkConfigBTC } from "@/ui/config/network/btc";
import { useBTCWallet } from "@/ui/context/wallet/BTCWalletProvider";
import { useAppState } from "@/ui/state";
import { satoshiToBtc } from "@/ui/utils/btc";
import { createStateUtils } from "@/ui/utils/createStateUtils";
import { formatNumber, formatStakingAmount } from "@/ui/utils/formTransforms";

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

interface FieldOptions {
  field: string;
  schema: Schema;
  errors?: Record<string, { level: "warning" | "default" | "error" }>;
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
  formFields: FieldOptions[];
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
    formFields: [],
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

  const formFields: FieldOptions[] = useMemo(
    () =>
      [
        {
          field: "finalityProvider",
          schema: string()
            .required("Add Finality Provider")
            .test(
              "invalidPublicKey",
              "Cannot select a finality provider with the same public key as the wallet",
              (value) => value !== publicKeyNoCoord,
            ),
          errors: {
            invalidPublicKey: { level: "error" },
          },
        },
        {
          field: "term",
          schema: number()
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
        },
        {
          field: "amount",
          schema: number()
            .transform(formatStakingAmount)
            .typeError("Staking amount must be a valid number.")
            .required("Enter BTC Amount to Stake")
            .moreThan(0, "Staking amount must be greater than 0.")
            .min(
              stakingInfo?.minStakingAmountSat ?? 0,
              `Minimum Staking ${satoshiToBtc(
                stakingInfo?.minStakingAmountSat ?? 0,
              )} ${coinName}`,
            )
            .max(
              stakingInfo?.maxStakingAmountSat ?? 0,
              `Maximum Staking ${satoshiToBtc(stakingInfo?.maxStakingAmountSat ?? 0)} ${coinName}`,
            )
            .test(
              "invalidBalance",
              "Staking Amount Exceeds Balance",
              (value = 0) => value <= stakableBtcBalance,
            )
            .test(
              "invalidFormat",
              "Staking amount must have no more than 8 decimal points.",
              (_, context) => validateDecimalPoints(context.originalValue),
            )
            // ???
            .test("insufficientFunds", "Insufficient BTC", () => true),
          errors: {
            invalidFormat: { level: "error" },
          },
        },
        {
          field: "feeRate",
          schema: number()
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
        },
        {
          field: "feeAmount",
          schema: number()
            .transform(formatNumber)
            .typeError("Staking fee amount must be a valid number.")
            .required("Staking fee amount is the required field.")
            .moreThan(0, "Staking fee amount must be greater than 0."),
        },
      ] as const,
    [publicKeyNoCoord, stakingInfo, stakableBtcBalance],
  );

  const validationSchema = useMemo(() => {
    const shape = formFields.reduce(
      (map, formItem) => ({ ...map, [formItem.field]: formItem.schema }),
      {} as ObjectShape,
    );

    return object()
      .shape(shape)
      .required() as ObjectSchema<MultistakingFormFields>;
  }, [formFields]);

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
      formFields,
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
      formFields,
    ],
  );

  return <StateProvider value={context}>{children}</StateProvider>;
}

export { useMultistakingState };
