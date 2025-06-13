import { Button, useFormState } from "@babylonlabs-io/core-ui";
import { twJoin } from "tailwind-merge";

import { AuthGuard } from "@/ui/components/Common/AuthGuard";
import { STAKING_DISABLED } from "@/ui/constants";
import { useBTCWallet } from "@/ui/context/wallet/BTCWalletProvider";
import { usePreviewButtonContent } from "@/ui/hooks/usePreviewButtonContent";
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
  const hasCriticalError = errorKeys.some(
    (key) => errors[key]?.type === "critical",
  );

  const getButtonState = () => {
    if (hasCriticalError) return "error";

    if (!isValid || STAKING_DISABLED || isGeoBlocked) {
      return "disabled";
    }

    return "default";
  };

  const buttonContent = usePreviewButtonContent({
    errors,
    isValidating,
    isLoading,
    fieldPriority,
  });

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
        {buttonContent}
      </Button>
    </AuthGuard>
  );
}
