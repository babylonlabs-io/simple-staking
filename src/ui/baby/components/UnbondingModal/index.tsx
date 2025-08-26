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
import type { FieldValues } from "react-hook-form";

import babylon from "@/infrastructure/babylon";
import { AmountField } from "@/ui/baby/components/AmountField";
import {
  useDelegationState,
  type Delegation,
} from "@/ui/baby/state/DelegationState";
import { createUnbondingValidationSchema } from "@/ui/baby/validation/unbondingValidation";
import { ResponsiveDialog } from "@/ui/common/components/Modals/ResponsiveDialog";

import { LoadingModal } from "../LoadingModal";

interface UnbondingModalProps {
  open: boolean;
  delegation: Delegation | null;
  onClose: () => void;
  onSubmit: (amount: string) => Promise<void>;
}

interface UnbondingFormData {
  amount: number;
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

  const handleFormSubmit = async (data: FieldValues) => {
    const formData = data as UnbondingFormData;
    await onSubmit(formData.amount.toString());
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
          Once the unbonding period begins:
          <br />• You will not receive staking rewards for the unbonding tokens.
          <br />• It will take 50 hours for the unbonding to be processed.
        </Warning>
      </DialogBody>

      <DialogFooter className="flex justify-end mt-[80px]">
        <Button onClick={handleSubmit(handleFormSubmit)} disabled={!isValid}>
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
  const { step } = useDelegationState();

  const availableBalance = delegation ? delegation.amount : 0n;
  const availableBalanceInBaby = delegation
    ? babylon.utils.ubbnToBaby(delegation.amount)
    : 0;

  const validationSchema = useMemo(
    () =>
      createUnbondingValidationSchema(availableBalance, availableBalanceInBaby),
    [availableBalance, availableBalanceInBaby],
  );

  if (step.name === "signing") {
    return (
      <LoadingModal
        title="Signing in progress"
        description="Please sign the unbonding transaction in your wallet to continue"
      />
    );
  } else if (step.name === "loading") {
    return (
      <LoadingModal
        title="Processing"
        description="Babylon Genesis is processing your unbonding transaction"
      />
    );
  }

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
