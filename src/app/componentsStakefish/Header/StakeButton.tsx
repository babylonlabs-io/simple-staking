import { useWalletConnect } from "@babylonlabs-io/wallet-connector";

import { Button, ButtonProps } from "@/ui";

export const StakeButton = (props: ButtonProps) => {
  const { open, connected } = useWalletConnect();

  return (
    <Button
      application
      size="sm"
      color="brand"
      {...props}
      onClick={connected ? props.onClick : open}
    >
      Stake now
    </Button>
  );
};
