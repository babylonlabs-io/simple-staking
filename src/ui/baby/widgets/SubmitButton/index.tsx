import { Button, useFormState } from "@babylonlabs-io/core-ui";

import { ConnectButton } from "@/ui/baby/components/ConnectButton";
import { useStakingState } from "@/ui/baby/state/StakingState";
import { AuthGuard } from "@/ui/common/components/Common/AuthGuard";

interface SubmitButton {
  disabled?: boolean;
  onClick?: () => void;
}

export function SubmitButton({ disabled = false, onClick }: SubmitButton) {
  const { isValid, errors } = useFormState();
  const { fields } = useStakingState();
  const errorField = fields.find((fieldName) => errors[fieldName]);

  return (
    <AuthGuard fallback={<ConnectButton disabled={disabled} />}>
      <Button
        //@ts-expect-error - fix type issue in core-ui
        type="submit"
        disabled={!isValid || disabled}
        className="w-full mt-2 capitalize disabled:!text-accent-primary disabled:!bg-accent-primary/10"
        onClick={onClick}
      >
        {errorField ? errors[errorField]?.message?.toString() : "Preview"}
      </Button>
    </AuthGuard>
  );
}
