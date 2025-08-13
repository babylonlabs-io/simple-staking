import { useMemo, useState, type PropsWithChildren } from "react";
import {
  array,
  number,
  object,
  ObjectSchema,
  ObjectShape,
  Schema,
  string,
} from "yup";

import { validateDecimalPoints } from "@/ui/common/components/Staking/Form/validation/validation";
import { getNetworkConfigBTC } from "@/ui/common/config/network/btc";
import { DEFAULT_MAX_FINALITY_PROVIDERS } from "@/ui/common/constants";
import { useMaxFinalityProviders } from "@/ui/common/hooks/useMaxFinalityProviders";
import { satoshiToBtc } from "@/ui/common/utils/btc";
import { createStateUtils } from "@/ui/common/utils/createStateUtils";
import {
  formatNumber,
  formatStakingAmount,
} from "@/ui/common/utils/formTransforms";

import { useBalanceState } from "./BalanceState";
import { StakingModalPage, useStakingState } from "./StakingState";

const { coinName } = getNetworkConfigBTC();

export interface MultistakingFormFields {
  finalityProviders: Record<string, string>;
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
  stakingModalPage: StakingModalPage;
  setStakingModalPage: (page: StakingModalPage) => void;
  maxFinalityProviders: number;
  validationSchema?: ObjectSchema<MultistakingFormFields>;
  formFields: FieldOptions[];
}

const { StateProvider, useState: useMultistakingState } =
  createStateUtils<MultistakingState>({
    stakingModalPage: StakingModalPage.DEFAULT,
    setStakingModalPage: () => {},
    maxFinalityProviders: DEFAULT_MAX_FINALITY_PROVIDERS, // Default to 1 FP in staking
    validationSchema: undefined,
    formFields: [],
  });

export function MultistakingState({ children }: PropsWithChildren) {
  const [stakingModalPage, setStakingModalPage] = useState<StakingModalPage>(
    StakingModalPage.DEFAULT,
  );
  const maxFinalityProviders = useMaxFinalityProviders();

  const { stakableBtcBalance, bbnBalance } = useBalanceState();
  const { stakingInfo } = useStakingState();

  const formFields: FieldOptions[] = useMemo(
    () =>
      [
        {
          field: "finalityProviders",
          schema: array()
            .of(string())
            .transform((value) => Object.values(value))
            .required("Add Finality Provider")
            .min(1, "Add Finality Provider")
            .max(
              maxFinalityProviders,
              `Maximum ${maxFinalityProviders} finality providers allowed.`,
            ),
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
            .test(
              "insufficientBabyBalance",
              "Insufficient BABY Balance",
              () => bbnBalance > 0,
            ),
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
    [stakingInfo, stakableBtcBalance, bbnBalance, maxFinalityProviders],
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

  const context = useMemo(
    () => ({
      stakingModalPage,
      setStakingModalPage,
      maxFinalityProviders,
      validationSchema,
      formFields,
    }),
    [
      stakingModalPage,
      setStakingModalPage,
      maxFinalityProviders,
      validationSchema,
      formFields,
    ],
  );

  return <StateProvider value={context}>{children}</StateProvider>;
}

export { useMultistakingState };
