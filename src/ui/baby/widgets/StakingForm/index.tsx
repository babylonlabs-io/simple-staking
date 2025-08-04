import { Form } from "@babylonlabs-io/core-ui";

import { AmountField } from "@/ui/baby/components/AmountField";
import { FeeField } from "@/ui/baby/components/FeeField";
import { useStakingState } from "@/ui/baby/state/StakingState";
import { StakingModal } from "@/ui/baby/widgets/StakingModal";
import { SubmitButton } from "@/ui/baby/widgets/SubmitButton";
import { ValidatorField } from "@/ui/baby/widgets/ValidatorField";

interface FormFields {
  amount: number;
  validatorAddresses: string[];
  feeAmount: number;
}

export default function StakingForm() {
  const { loading, formSchema, balance, babyPrice, calculateFee, showPreview } =
    useStakingState();

  const handlePreview = ({
    amount,
    validatorAddresses,
    feeAmount,
  }: FormFields) => {
    showPreview({ amount, feeAmount, validatorAddress: validatorAddresses[0] });
  };

  return (
    <Form
      schema={formSchema}
      className="flex flex-col gap-2 h-[500px]"
      onSubmit={handlePreview}
    >
      <AmountField balance={balance} price={babyPrice} />
      <ValidatorField />
      <FeeField babyPrice={babyPrice} calculateFee={calculateFee} />

      <SubmitButton disabled={loading} />
      <StakingModal />
    </Form>
  );
}
