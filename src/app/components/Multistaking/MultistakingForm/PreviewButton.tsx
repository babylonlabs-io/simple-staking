import { Button, useFormState } from "@babylonlabs-io/core-ui";
import { twJoin } from "tailwind-merge";

import { useBTCWallet } from "@/app/context/wallet/BTCWalletProvider";
import { AuthGuard } from "@/components/common/AuthGuard";

const ERROR_MESSAGE_MAP: Record<string, string> = {
  "insufficient funds: unable to gather enough utxos to cover the staking amount and fees":
    "Insufficient BTC",
  "staking amount (stakingamountsat) is required for staking input.":
    "Enter BTC Amount to Stake",
  "please select a finality provider": "Add Finality Provider",
};

function beautifyErrorMessages(error: string): string {
  const lowerError = error.toLowerCase();
  return ERROR_MESSAGE_MAP[lowerError] || error;
}

export function PreviewButton() {
  const { open } = useBTCWallet();
  const form = useFormState();
  const { isValid, errors, isValidating, isLoading } = form;

  const errorKeys = Object.keys(errors);
  const errorMessages = errorKeys.map((key) => errors[key]?.message);
  const hasError = errorMessages.length > 0;

  const renderButtonContent = () => {
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

  return (
    <AuthGuard
      fallback={
        <Button onClick={open} className={"w-full mt-2"}>
          Connect Wallet
        </Button>
      }
    >
      <Button
        //@ts-ignore - fix type issue in core-ui
        type="submit"
        className={twJoin(
          "w-full mt-2 capitalize",
          hasError && "!text-accent-primary !bg-accent-primary/10",
        )}
        disabled={!isValid || isValidating || isLoading}
      >
        {renderButtonContent()}
      </Button>
    </AuthGuard>
  );
}
