import { Button, useFormState } from "@babylonlabs-io/core-ui";
import { twMerge } from "tailwind-merge";

import { useFormError } from "@/ui/common/hooks/useFormError";

const BUTTON_STYLES: Record<string, string> = {
  error: "disabled:!text-error-main disabled:!bg-error-main/10",
  default: "",
};

interface Props {
  text?: string;
  loadingText?: string;
  calculatingText?: string;
  className?: string;
  disabled?: boolean;
  additionalValidation?: () => boolean;
}

export function GenericSubmitButton({
  text = "Submit",
  loadingText = "Loading...",
  calculatingText = "Calculating...",
  className = "",
  disabled = false,
  additionalValidation,
}: Props) {
  const { isValid, isValidating, isLoading } = useFormState();
  const error = useFormError();

  const renderText = () => {
    if (isValidating) {
      return calculatingText;
    }

    if (isLoading) {
      return loadingText;
    }

    if (error) {
      return error.message;
    }

    return text;
  };

  const isDisabled =
    !isValid ||
    isValidating ||
    isLoading ||
    disabled ||
    (additionalValidation && !additionalValidation());

  return (
    <Button
      //@ts-expect-error - fix type issue in core-ui
      type="submit"
      className={twMerge(
        "w-full mt-2 capitalize disabled:!text-accent-primary/50 disabled:!bg-accent-primary/10",
        error?.level && BUTTON_STYLES[error.level],
        className,
      )}
      disabled={isDisabled}
    >
      {renderText()}
    </Button>
  );
}
