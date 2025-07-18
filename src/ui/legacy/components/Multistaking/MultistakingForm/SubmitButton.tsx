import { Button, useFormState } from "@babylonlabs-io/core-ui";
import { twMerge } from "tailwind-merge";

import { STAKING_DISABLED } from "@/ui/legacy/constants";
import { useFormError } from "@/ui/legacy/hooks/useFormError";
import { useStakingState } from "@/ui/legacy/state/StakingState";

const BUTTON_STYLES: Record<string, string> = {
  error: "disabled:!text-error-main disabled:!bg-error-main/10",
  default: "",
};

export function SubmitButton() {
  const { isValid, isValidating, isLoading } = useFormState();
  const { blocked: isGeoBlocked } = useStakingState();
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
        STAKING_DISABLED ||
        isGeoBlocked
      }
    >
      {renderText()}
    </Button>
  );
}
