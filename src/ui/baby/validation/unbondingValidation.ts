import { number, object } from "yup";

import { validateDecimalPoints } from "@/ui/common/components/Staking/Form/validation/validation";
import { formatBabyStakingAmount } from "@/ui/common/utils/formTransforms";

/**
 * Creates a validation schema for unbonding amount
 * @param availableBalance - The available balance in micro-BABY (BigInt)
 * @param availableBalanceInBaby - The available balance formatted in BABY (number)
 * @returns Yup validation schema for unbonding form
 */
export const createUnbondingValidationSchema = (
  availableBalance: bigint,
  availableBalanceInBaby: number,
) => {
  return object().shape({
    amount: number()
      .typeError("Unbonding amount must be a valid number.")
      .transform(formatBabyStakingAmount)
      .required("Enter BABY Amount to Unbond")
      .moreThan(0, "Unbonding amount must be greater than 0.")
      .test(
        "invalidBalance",
        `Unbonding amount cannot exceed your staked balance (${availableBalanceInBaby} BABY).`,
        (transformedValue = 0, context) => {
          // Get the original input value before transformation
          const originalValue = context.originalValue;
          const valueInMicroBaby = BigInt(
            Math.round(originalValue * 1_000_000),
          );
          console.log("🔍 BABY Unbonding Balance Validation:", {
            transformedValue,
            originalValue: originalValue,
            valueInMicroBaby: valueInMicroBaby.toString(),
            availableBalance: availableBalance.toString(),
            availableBalanceInBaby: availableBalanceInBaby,
            passes: valueInMicroBaby <= availableBalance,
          });
          return valueInMicroBaby <= availableBalance;
        },
      )
      .test(
        "invalidFormat",
        "Unbonding amount must have no more than 6 decimal points.",
        (_, context) => validateDecimalPoints(context.originalValue, 6),
      ),
  });
};
