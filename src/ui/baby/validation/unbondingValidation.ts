import { number, object } from "yup";

import { validateDecimalPoints } from "@/ui/common/components/Staking/Form/validation/validation";
import { createBalanceValidator } from "@/ui/common/utils/bbn";
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
  const balanceValidator = createBalanceValidator(availableBalance);

  return object().shape({
    amount: number()
      .typeError("Unbonding amount must be a valid number.")
      .transform(formatBabyStakingAmount)
      .required("Enter BABY Amount to Unbond")
      .moreThan(0, "Unbonding amount must be greater than 0.")
      .test(
        "invalidBalance",
        `Unbonding amount cannot exceed your staked balance (${availableBalanceInBaby} BABY).`,
        (_, context) => balanceValidator(context.originalValue),
      )
      .test(
        "invalidFormat",
        "Unbonding amount must have no more than 6 decimal points.",
        (_, context) => validateDecimalPoints(context.originalValue, 6),
      ),
  });
};
