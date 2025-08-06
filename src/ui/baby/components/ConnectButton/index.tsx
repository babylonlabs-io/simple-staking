import { Button } from "@babylonlabs-io/core-ui";

import { useBTCWallet } from "@/ui/common/context/wallet/BTCWalletProvider";

interface ConnectButtonProps {
  disabled?: boolean;
}

export function ConnectButton({ disabled }: ConnectButtonProps) {
  const { open } = useBTCWallet();

  return (
    <Button
      //@ts-expect-error - fix type issue in core-ui
      type="button"
      onClick={open}
      className="w-full mt-2"
      disabled={disabled}
    >
      Connect Wallet
    </Button>
  );
}
