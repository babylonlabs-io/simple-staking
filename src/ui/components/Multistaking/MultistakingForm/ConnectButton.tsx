import { Button } from "@babylonlabs-io/core-ui";

import { useBTCWallet } from "@/ui/context/wallet/BTCWalletProvider";
import { useStakingState } from "@/ui/state/StakingState";

export function ConnectButton() {
  const { open } = useBTCWallet();
  const { blocked: isGeoBlocked } = useStakingState();

  return (
    <Button onClick={open} className={"w-full mt-2"} disabled={isGeoBlocked}>
      Connect Wallet
    </Button>
  );
}
