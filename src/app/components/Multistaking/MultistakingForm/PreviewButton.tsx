import { Button, useFormState } from "@babylonlabs-io/core-ui";
import { twJoin } from "tailwind-merge";

export function PreviewButton() {
  const { isValid, errors } = useFormState();
  const errorKeys = Object.keys(errors);
  const errorMessages = errorKeys.map((key) => errors[key]?.message);
  const hasError = errorMessages.length > 0;

  const renderButtonContent = () => {
    if (hasError) {
      return errorMessages[0]?.toString();
    }

    return "Preview";
  };

  return (
    <Button
      //@ts-ignore - fix type issue in core-ui
      type="submit"
      className={twJoin(
        "w-full mt-2",
        hasError &&
          "!text-[#12495E] !bg-[#EBF1F3] hover:!bg-[#EBF1F3] !brightness-100",
      )}
      disabled={!isValid}
    >
      {renderButtonContent()}
    </Button>
  );
}
