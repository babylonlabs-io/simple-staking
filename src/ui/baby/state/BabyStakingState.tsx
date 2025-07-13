import { useMemo, useState, type PropsWithChildren } from "react";
import { number, object, ObjectSchema, string } from "yup";

import { createStateUtils } from "@/ui/common/utils/createStateUtils";
import { formatNumber } from "@/ui/common/utils/formTransforms";
import { useBbnQuery } from "@/ui/legacy/hooks/client/rpc/queries/useBbnQuery";
import { ubbnToBaby } from "@/ui/legacy/utils/bbn";

export enum BabyStakingModalPage {
  DEFAULT,
  VALIDATOR_SELECTION,
}

export interface BabyStakingFormFields {
  validatorAddress: string;
  amount: number;
}

export interface BabyStakingState {
  stakingModalPage: BabyStakingModalPage;
  setStakingModalPage: (page: BabyStakingModalPage) => void;
  validationSchema?: ObjectSchema<BabyStakingFormFields>;
  processing: boolean;
  setProcessing: (processing: boolean) => void;
}

const { StateProvider, useState: useBabyStakingState } =
  createStateUtils<BabyStakingState>({
    stakingModalPage: BabyStakingModalPage.DEFAULT,
    setStakingModalPage: () => {},
    validationSchema: undefined,
    processing: false,
    setProcessing: () => {},
  });

export function BabyStakingState({ children }: PropsWithChildren) {
  const [stakingModalPage, setStakingModalPage] =
    useState<BabyStakingModalPage>(BabyStakingModalPage.DEFAULT);
  const [processing, setProcessing] = useState(false);
  const { balanceQuery } = useBbnQuery();

  const bbnBalance = balanceQuery.data || 0;
  const tbabyBalance = ubbnToBaby(bbnBalance);

  const validationSchema = useMemo(() => {
    return object()
      .shape({
        validatorAddress: string()
          .required("Please select a validator")
          .min(1, "Please select a validator"),

        amount: number()
          .transform((value) => {
            const formatted = formatNumber(value);
            return formatted;
          })
          .typeError("Staking amount must be a valid number.")
          .required("Please enter an amount to stake")
          .moreThan(0, "Staking amount must be greater than 0.")
          .max(
            tbabyBalance,
            `Staking amount exceeds your balance (${tbabyBalance.toFixed(6)} tBABY)`,
          )
          .test(
            "decimal-points",
            "Staking amount must have no more than 6 decimal points.",
            (_, context) => {
              const originalValue = context.originalValue;
              if (typeof originalValue === "string") {
                const decimalPoints = originalValue.split(".")[1]?.length || 0;
                return decimalPoints <= 6;
              }
              return true;
            },
          ),
      })
      .required() as ObjectSchema<BabyStakingFormFields>;
  }, [tbabyBalance]);

  const context = useMemo(
    () => ({
      stakingModalPage,
      setStakingModalPage,
      validationSchema,
      processing,
      setProcessing,
    }),
    [
      stakingModalPage,
      setStakingModalPage,
      validationSchema,
      processing,
      setProcessing,
    ],
  );

  return <StateProvider value={context}>{children}</StateProvider>;
}

export { useBabyStakingState };
