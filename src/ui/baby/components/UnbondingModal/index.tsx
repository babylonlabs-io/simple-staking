/* eslint-disable @typescript-eslint/ban-ts-comment */
import {
  Button,
  DialogBody,
  DialogFooter,
  DialogHeader,
  Form,
  Text,
  Warning,
  useFormContext,
  useFormState,
} from "@babylonlabs-io/core-ui";
import { useMemo } from "react";
import { number, object } from "yup";

import babylon from "@/infrastructure/babylon";
import { AmountField } from "@/ui/baby/components/AmountField";
import { type Delegation } from "@/ui/baby/state/DelegationState";
import { ResponsiveDialog } from "@/ui/common/components/Modals/ResponsiveDialog";
import { validateDecimalPoints } from "@/ui/common/components/Staking/Form/validation/validation";
import { formatBabyStakingAmount } from "@/ui/common/utils/formTransforms";

interface UnbondingModalProps {
  open: boolean;
  delegation: Delegation | null;
  onClose: () => void;
  onSubmit: (amount: string) => Promise<void>;
}

const MAX_WINDOW_HEIGHT = 500;

const UnbondingModalContent = ({
  delegation,
  onClose,
  onSubmit,
}: {
  delegation: Delegation;
  onClose: () => void;
  onSubmit: (amount: string) => Promise<void>;
}) => {
  const { handleSubmit } = useFormContext();
  const { isValid } = useFormState();

  const availableBalance = babylon.utils.ubbnToBaby(delegation.amount);
  const validatorName =
    delegation.validator.name || delegation.validator.address;

  const handleFormSubmit = async (data: { amount: number }) => {
    await onSubmit(data.amount.toString());
  };

  return (
    <ResponsiveDialog open onClose={onClose}>
      <DialogHeader
        title={`Unbond ${validatorName}`}
        onClose={onClose}
        className="text-accent-primary"
      />

      <DialogBody
        style={{ maxHeight: MAX_WINDOW_HEIGHT }}
        className="no-scrollbar mt-4 flex flex-col gap-6 overflow-y-auto text-accent-primary"
      >
        <Text
          as="div"
          variant="body2"
          className="text-accent-secondary whitespace-pre-line"
        >
          Choose how much BABY you'd like to unbond from your current
          delegation. Unbonded tokens will enter a waiting period before they
          become available to withdraw. Your remaining stake will continue
          earning rewards.
        </Text>

        <AmountField balance={availableBalance} price={1} />

        <Warning>
          Once the unstaking period begins:
          <br />• You will not receive staking rewards
          <br />• It will take 50 hours for the amount to be liquid
          <br />• But you will be able to cancel the unstaking process anytime,
          as this chain currently supports the function
        </Warning>
      </DialogBody>

      <DialogFooter className="flex justify-end mt-[80px]">
        {/* @ts-expect-error */}
        <Button
          type="submit"
          onClick={handleSubmit(handleFormSubmit)}
          disabled={!isValid}
        >
          Unbond
        </Button>
      </DialogFooter>
    </ResponsiveDialog>
  );
};

export const UnbondingModal = ({
  open,
  delegation,
  onClose,
  onSubmit,
}: UnbondingModalProps) => {
  const availableBalance = delegation ? delegation.amount : 0n;
  const availableBalanceInBaby = delegation
    ? babylon.utils.ubbnToBaby(delegation.amount)
    : 0;

  const validationSchema = useMemo(
    () =>
      object().shape({
        amount: number()
          .transform(formatBabyStakingAmount)
          .typeError("Unbonding amount must be a valid number.")
          .required("Enter BABY Amount to Unbond")
          .moreThan(0, "Unbonding amount must be greater than 0.")
          .test(
            "invalidBalance",
            `Unbonding amount cannot exceed your staked balance (${availableBalanceInBaby} BABY).`,
            (value = 0) => BigInt(value) <= availableBalance,
          )
          .test(
            "invalidFormat",
            "Unbonding amount must have no more than 6 decimal points.",
            (_, context) => validateDecimalPoints(context.originalValue, 6),
          ),
      }),
    [availableBalance, availableBalanceInBaby],
  );

  if (!open || !delegation) return null;

  return (
    <Form schema={validationSchema} mode="onChange" reValidateMode="onChange">
      <UnbondingModalContent
        delegation={delegation}
        onClose={onClose}
        onSubmit={onSubmit}
      />
    </Form>
  );
};
