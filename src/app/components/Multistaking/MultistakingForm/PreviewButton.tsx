import { Button, useFormState } from "@babylonlabs-io/core-ui";
import { twJoin } from "tailwind-merge";

import { AuthGuard } from "@/app/components/Common/AuthGuard";
import { STAKING_DISABLED } from "@/app/constants";
import { useBTCWallet } from "@/app/context/wallet/BTCWalletProvider";
import { useStakingState } from "@/app/state/StakingState";

const ERROR_MESSAGE_MAP: Record<string, string> = {
  "insufficient funds: unable to gather enough utxos to cover the staking amount and fees":
    "Insufficient BTC",
  "staking amount (stakingamountsat) is required for staking input.":
    "Enter BTC Amount to Stake",
  "staking amount is the required field.": "Enter BTC Amount to Stake",
  "please select a finality provider": "Add Finality Provider",
  "staking amount exceeds your balance": "Staking Amount Exceeds Balance",
};

const BUTTON_STATE_STYLES = {
  error: "!text-error-main !bg-error-main/10",
  disabled: "!text-accent-primary/50 !bg-accent-primary/10",
  default: "",
} as const;

function beautifyErrorMessages(error: string): string {
  const normalizedError = error.toLowerCase();
  return ERROR_MESSAGE_MAP[normalizedError] || error;
}

export function PreviewButton() {
  const { open } = useBTCWallet();
  const form = useFormState();
  const { isValid, errors, isValidating, isLoading } = form;
  const { blocked: isGeoBlocked } = useStakingState();

  const errorKeys = Object.keys(errors);
  const errorMessages = errorKeys.map((key) => errors[key]?.message);
  const hasError = errorMessages.length > 0;

  const getButtonState = () => {
    if (hasError) return "error";
    if (STAKING_DISABLED || isGeoBlocked) return "disabled";
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
      const requiredErrors = errorKeys.filter(
        (key) => errors[key]?.type === "required",
      );
      if (requiredErrors.length > 0) {
        selectedError = errors[requiredErrors[0]]?.message?.toString() || "";
      } else {
        selectedError = errorMessages[0]?.toString() || "";
      }

      return beautifyErrorMessages(selectedError);
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
