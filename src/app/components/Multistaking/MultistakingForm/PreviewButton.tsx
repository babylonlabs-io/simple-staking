import { Button, useFormState } from "@babylonlabs-io/core-ui";
import { twJoin } from "tailwind-merge";

import { AuthGuard } from "@/app/components/Common/AuthGuard";
import { STAKING_DISABLED } from "@/app/constants";
import { useBTCWallet } from "@/app/context/wallet/BTCWalletProvider";
import { useStakingState } from "@/app/state/StakingState";

const BUTTON_STATE_STYLES = {
  error: "!text-error-main !bg-error-main/10",
  disabled: "!text-accent-primary/50 !bg-accent-primary/10",
  default: "",
} as const;

export function PreviewButton() {
  const { open } = useBTCWallet();
  const form = useFormState();
  const { isValid, errors, isValidating, isLoading } = form;
  const { blocked: isGeoBlocked } = useStakingState();

  const errorKeys = Object.keys(errors);
  const errorMessages = errorKeys.map((key) => errors[key]?.message);

  const hasCriticalError = errorKeys.some(
    (key) => errors[key]?.type === "critical",
  );

  const hasError = errorMessages.length > 0;

  const getButtonState = () => {
    if (hasCriticalError) return "error";

    // Treat any other invalid form state as disabled to show gray styling
    if (!isValid || STAKING_DISABLED || isGeoBlocked) {
      return "disabled";
    }

    return "default";
  };

  const renderButtonContent = () => {
    if (STAKING_DISABLED) {
      return "Preview";
    }

    if (isValidating) {
      return "Calculating...";
    }

    if (isLoading) {
      return "Loading...";
    }

    if (hasError) {
      let selectedError = "";
      // Filter for required field errors first, as they take priority
      const requiredErrors = errorKeys.filter(
        (key) => errors[key]?.type === "required",
      );

      // If there are required field errors, show the first one
      // Otherwise fall back to showing the first error message of any type
      if (requiredErrors.length > 0) {
        selectedError = errors[requiredErrors[0]]?.message?.toString() || "";
      } else {
        selectedError = errorMessages[0]?.toString() || "";
      }

      return selectedError;
    }

    return "Preview";
  };

  const buttonState = getButtonState();

  return (
    <AuthGuard
      fallback={
        <Button
          onClick={open}
          className={"w-full mt-2"}
          disabled={isGeoBlocked}
        >
          Connect Wallet
        </Button>
      }
    >
      <Button
        //@ts-expect-error - fix type issue in core-ui
        type="submit"
        className={twJoin(
          "w-full mt-2 capitalize",
          BUTTON_STATE_STYLES[buttonState],
        )}
        disabled={
          !isValid ||
          isValidating ||
          isLoading ||
          STAKING_DISABLED ||
          isGeoBlocked
        }
      >
        {renderButtonContent()}
      </Button>
    </AuthGuard>
  );
}
