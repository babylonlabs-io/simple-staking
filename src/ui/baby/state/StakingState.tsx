import { type PropsWithChildren, useCallback, useMemo, useState } from "react";
import { array, number, object, ObjectSchema, ObjectShape, string } from "yup";

import babylon from "@/infrastructure/babylon";
import { useDelegationService } from "@/ui/baby/hooks/services/useDelegationService";
import { useValidatorService } from "@/ui/baby/hooks/services/useValidatorService";
import { useWalletService } from "@/ui/baby/hooks/services/useWalletService";
import { validateDecimalPoints } from "@/ui/common/components/Staking/Form/validation/validation";
import { useError } from "@/ui/common/context/Error/ErrorProvider";
import { usePrice } from "@/ui/common/hooks/client/api/usePrices";
import { useLogger } from "@/ui/common/hooks/useLogger";
import { MultistakingFormFields } from "@/ui/common/state/MultistakingState";
import {
  createBalanceValidator,
  createMinAmountValidator,
} from "@/ui/common/utils/bbn";
import { createStateUtils } from "@/ui/common/utils/createStateUtils";
import {
  formatBabyStakingAmount,
  formatNumber,
} from "@/ui/common/utils/formTransforms";

import { usePendingOperationsService } from "../hooks/services/usePendingOperationsService";

const MIN_STAKING_AMOUNT = 0.01;

export interface FormData {
  validatorAddress: string;
  amount: number;
  feeAmount: number;
}

interface PreviewData {
  amount: number;
  feeAmount: number;
  validator: {
    address: string;
    name: string;
    url?: string;
  };
}

interface Step<K extends string, D = never> {
  name: K;
  data?: D;
}

type StakingStep =
  | Step<"initial">
  | Step<"preview", PreviewData>
  | Step<"signing">
  | Step<"loading">
  | Step<"success", { txHash: string }>;

interface StakingState {
  loading: boolean;
  formSchema: any;
  step: StakingStep;
  availableBalance: number;
  babyPrice: number;
  fields: string[];
  showPreview(data: FormData): void;
  closePreview(): void;
  submitForm(): Promise<void>;
  resetForm(): void;
  calculateFee: (params: Omit<FormData, "feeAmount">) => Promise<number>;
}

const { StateProvider, useState: useStakingState } =
  createStateUtils<StakingState>({
    loading: true,
    formSchema: null,
    step: { name: "initial" },
    availableBalance: 0,
    babyPrice: 0,
    fields: [],
    calculateFee: async () => 0,
    showPreview: () => {},
    closePreview: () => {},
    submitForm: async () => {},
    resetForm: () => {},
  });

function StakingState({ children }: PropsWithChildren) {
  const [step, setStep] = useState<StakingStep>({ name: "initial" });

  const { stake, sendTx, estimateStakingFee } = useDelegationService();
  const { validatorMap, loading } = useValidatorService();
  const { balance } = useWalletService();
  const { handleError } = useError();
  const logger = useLogger();
  const babyPrice = usePrice("BABY");

  const minAmountValidator = useMemo(
    () => createMinAmountValidator(MIN_STAKING_AMOUNT),
    [],
  );
  // Subtract the pending stake amount from the balance
  const { getTotalPendingStake } = usePendingOperationsService();
  const availableBalance = balance - getTotalPendingStake();

  const balanceValidator = useMemo(
    () => createBalanceValidator(availableBalance),
    [availableBalance],
  );

  const fieldSchemas = useMemo(
    () =>
      [
        {
          field: "amount",
          schema: number()
            .transform(formatBabyStakingAmount)
            .typeError("Staking amount must be a valid number")
            .required("Enter BABY Amount to Stake")
            .moreThan(0, "Staking amount must be greater than 0")
            .test(
              "invalidMinAmount",
              `Minimum staking amount is ${MIN_STAKING_AMOUNT} BABY`,
              (_, context) => minAmountValidator(context.originalValue),
            )
            .test(
              "invalidBalance",
              "Staking Amount Exceeds Available Balance",
              (_, context) => balanceValidator(context.originalValue),
            )
            .test(
              "invalidFormat",
              "Staking amount must have no more than 6 decimal points",
              (_, context) => validateDecimalPoints(context.originalValue, 6),
            ),
        },
        {
          field: "validatorAddresses",
          schema: array()
            .of(string())
            .required("Add Validator")
            .min(1, "Add Validator"),
        },
        {
          field: "feeAmount",
          schema: number()
            .transform(formatNumber)
            .optional()
            .test(
              "invalidBalance",
              "Fee Amount Exceeds Balance",
              (value = 0) => {
                const valueInMicroBaby = BigInt(Math.floor(value));
                return valueInMicroBaby <= availableBalance;
              },
            ),
        },
      ] as const,
    [availableBalance, minAmountValidator, balanceValidator],
  );

  const formSchema = useMemo(() => {
    const shape = fieldSchemas.reduce(
      (map, formItem) => ({ ...map, [formItem.field]: formItem.schema }),
      {} as ObjectShape,
    );

    return object()
      .shape(shape)
      .required() as ObjectSchema<MultistakingFormFields>;
  }, [fieldSchemas]);

  const fields = useMemo(
    () => fieldSchemas.map((schema) => schema.field),
    [fieldSchemas],
  );

  const showPreview = useCallback(
    ({ amount, feeAmount, validatorAddress }: FormData) => {
      const validator = validatorMap[validatorAddress];
      const formData: PreviewData = {
        amount,
        feeAmount,
        validator: {
          address: validator.address,
          name: validator.name,
          url: "",
        },
      };
      setStep({ name: "preview", data: formData });
    },
    [validatorMap],
  );

  const closePreview = useCallback(() => {
    setStep({ name: "initial" });
  }, []);

  const submitForm = useCallback(async () => {
    if (step.name !== "preview" || !step.data) return;

    try {
      setStep({ name: "signing" });
      const amount = step.data.amount;
      const validatorAddress = step.data.validator.address;
      const { signedTx } = await stake({
        amount,
        validatorAddress,
      });

      setStep({ name: "loading" });
      const result = await sendTx(
        signedTx,
        "stake",
        validatorAddress,
        BigInt(amount),
      );
      logger.info("Baby Staking: Stake", {
        txHash: result?.txHash,
      });
      setStep({ name: "success", data: { txHash: result?.txHash } });
    } catch (error: any) {
      handleError({ error });
      logger.error(error);
      setStep({ name: "initial" });
    }
  }, [step, logger, stake, handleError, sendTx]);

  const calculateFee = useCallback(
    async ({ validatorAddress, amount }: Omit<FormData, "feeAmount">) => {
      try {
        return estimateStakingFee({ validatorAddress, amount });
      } catch (error: any) {
        handleError({ error });
        logger.error(error);
        return 0;
      }
    },
    [estimateStakingFee, handleError, logger],
  );

  const resetForm = useCallback(() => {
    setStep({ name: "initial" });
  }, []);

  const context = useMemo(() => {
    const displayBalance = babylon.utils.ubbnToBaby(availableBalance);
    return {
      loading,
      step,
      availableBalance: displayBalance,
      formSchema,
      fields,
      babyPrice,
      calculateFee,
      showPreview,
      submitForm,
      resetForm,
      closePreview,
    };
  }, [
    availableBalance,
    loading,
    step,
    formSchema,
    fields,
    babyPrice,
    calculateFee,
    showPreview,
    submitForm,
    resetForm,
    closePreview,
  ]);

  return <StateProvider value={context}>{children}</StateProvider>;
}

export { StakingState, useStakingState };
