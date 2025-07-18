import { Form } from "@babylonlabs-io/core-ui";
import { useCallback } from "react";

import {
  useMultistakingState,
  type MultistakingFormFields,
} from "@/ui/common/state/MultistakingState";
import { StakingStep, useStakingState } from "@/ui/common/state/StakingState";

import { MultistakingFormContent } from "./MultistakingFormContent";

export function MultistakingForm() {
  const { stakingInfo, setFormData, goToStep } = useStakingState();
  const { validationSchema } = useMultistakingState();

  const handlePreview = useCallback(
    (formValues: MultistakingFormFields) => {
      setFormData({
        finalityProviders: Object.values(formValues.finalityProviders),
        term: Number(formValues.term),
        amount: Number(formValues.amount),
        feeRate: Number(formValues.feeRate),
        feeAmount: Number(formValues.feeAmount),
      });

      goToStep(StakingStep.PREVIEW);
    },
    [setFormData, goToStep],
  );

  if (!stakingInfo) {
    return null;
  }

  return (
    <Form
      schema={validationSchema as any}
      mode="onChange"
      reValidateMode="onChange"
      onSubmit={handlePreview}
    >
      <MultistakingFormContent />
    </Form>
  );
}
