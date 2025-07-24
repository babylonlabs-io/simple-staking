import { Button, useFormState } from "@babylonlabs-io/core-ui";
import { twMerge } from "tailwind-merge";

import { STAKING_DISABLED } from "@/ui/common/constants";
import { useFormError } from "@/ui/common/hooks/useFormError";
import { useBalanceState } from "@/ui/common/state/BalanceState";
import { useStakingState } from "@/ui/common/state/StakingState";

const BUTTON_STYLES: Record<string, string> = {
  error: "disabled:!text-error-main disabled:!bg-error-main/10",
  default: "",
};

export function SubmitButton() {
  const { isValid, isValidating, isLoading } = useFormState();
  const { blocked: isGeoBlocked } = useStakingState();
  const { bbnBalance } = useBalanceState();
  const error = useFormError();

  const renderText = () => {
    if (isValidating) {
      return "Calculating...";
    }

    if (isLoading) {
      return "Loading...";
    }

    if (error) {
      return error.message;
    }

    if (bbnBalance === 0) {
      return "Insufficient BABY Balance";
    }

    return "Preview";
  };

  return (
    <Button
      //@ts-expect-error - fix type issue in core-ui
      type="submit"
      className={twMerge(
        "w-full mt-2 capitalize disabled:!text-accent-primary disabled:!bg-accent-primary/10",
        error?.level && BUTTON_STYLES[error.level],
      )}
      disabled={
        !isValid ||
        isValidating ||
        isLoading ||
        bbnBalance === 0 || // Disable when user has no BABY balance
        STAKING_DISABLED ||
        isGeoBlocked
      }
    >
      {renderText()}
    </Button>
  );
}
