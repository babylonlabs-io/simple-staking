import { Button, useFormState } from "@babylonlabs-io/core-ui";
import { twJoin } from "tailwind-merge";

import { useBTCWallet } from "@/app/context/wallet/BTCWalletProvider";
import { AuthGuard } from "@/components/common/AuthGuard";

function beautifyErrorMessages(error: string) {
  switch (error.toLowerCase()) {
    case "Insufficient funds: unable to gather enough UTXOs to cover the staking amount and fees".toLowerCase():
      return "Insufficient BTC";
    case "Staking amount (stakingAmountSat) is required for staking input.".toLowerCase():
      return "Enter BTC Amount to Stake";
    case "Please select a finality provider".toLowerCase():
      return "Add Finality Provider";
    default:
      return error;
  }
}

export function PreviewButton() {
  const { open } = useBTCWallet();
  const form = useFormState();
  const { isValid, errors, isValidating, isLoading } = form;

  const errorKeys = Object.keys(errors);
  const errorMessages = errorKeys.map((key) => errors[key]?.message);
  const hasError = errorMessages.length > 0;

  const renderButtonContent = () => {
    /**
     * Add Finality Provider
     * Insufficient BABY
     */

    console.log({ errors, isValidating, isLoading });

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
