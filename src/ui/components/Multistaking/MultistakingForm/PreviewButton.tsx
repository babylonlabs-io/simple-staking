import { Button, useFormState } from "@babylonlabs-io/core-ui";
import { twJoin } from "tailwind-merge";

import { AuthGuard } from "@/ui/components/Common/AuthGuard";
import { STAKING_DISABLED } from "@/ui/constants";
import { useBTCWallet } from "@/ui/context/wallet/BTCWalletProvider";
import { useStakingState } from "@/ui/state/StakingState";

const BUTTON_STATE_STYLES = {
  error: "!text-error-main !bg-error-main/10",
  disabled: "!text-accent-primary/50 !bg-accent-primary/10",
  default: "",
} as const;

interface PreviewButtonProps {
  fieldPriority?: readonly string[];
}

export function PreviewButton({ fieldPriority = [] }: PreviewButtonProps) {
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
      const prioritizedKeys =
        fieldPriority.length > 0 ? fieldPriority : errorKeys;

      const findKey = (predicate: (key: string) => boolean) =>
        prioritizedKeys.find((key) => predicate(key) && errors[key]);

      const criticalKey = findKey((k) => errors[k]?.type === "critical");
      if (criticalKey) {
        return errors[criticalKey]?.message?.toString() || "";
      }

      const requiredKey = findKey((k) => errors[k]?.type === "required");
      if (requiredKey) {
        return errors[requiredKey]?.message?.toString() || "";
      }

      const firstKey = prioritizedKeys.find((k) => errors[k]);
      if (firstKey) {
        return errors[firstKey]?.message?.toString() || "";
      }

      return errorMessages[0]?.toString() || "";
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
