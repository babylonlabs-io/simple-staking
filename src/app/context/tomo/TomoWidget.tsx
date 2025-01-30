import { Text } from "@babylonlabs-io/bbn-core-ui";
import {
  useClickWallet,
  useWalletListWithIsInstall,
} from "@tomo-inc/wallet-connect-sdk";
import { useMemo } from "react";
import { twJoin } from "tailwind-merge";

import { ErrorState } from "@/app/types/errors";

import { useError } from "../Error/ErrorContext";

interface TomoWidgetProps {
  chainName: "bitcoin" | "cosmos";
}

export const TomoWidget = ({ chainName }: TomoWidgetProps) => {
  const { showError, captureError } = useError();
  const selectWallet = useClickWallet();
  const wallets = useWalletListWithIsInstall();

  const walletList = useMemo(
    () =>
      (wallets ?? []).filter((wallet: any) => wallet.chainType === chainName),
    [wallets, chainName],
  );

  const handleClick = async (wallet: any) => {
    try {
      await selectWallet(wallet);
    } catch (e: any) {
      showError({
        error: {
          message: e.message,
          errorState: ErrorState.WALLET,
        },
      });
      captureError(e);
    }
  };

  return (
    <div className="pt-10 text-accent-primary">
      <Text className="mb-4">More wallets with Tomo Connect</Text>

      <div className="grid grid-cols-7 gap-6 items-center justify-between border border-secondary-strokeLight rounded p-6">
        {walletList.map((wallet: any) => (
          <button
            disabled={!wallet.isInstall}
            className={twJoin(
              "flex flex-col items-center gap-2.5",
              wallet.isInstall ? "opacity-100" : "opacity-50",
            )}
            key={wallet.id}
            onClick={() => handleClick(wallet)}
          >
            <img
              className="h-10 w-10 object-contain"
              src={wallet.img}
              alt={wallet.name}
            />

            <Text className="leading-none whitespace-nowrap" variant="body2">
              {wallet.name}
            </Text>
          </button>
        ))}
      </div>
    </div>
  );
};
