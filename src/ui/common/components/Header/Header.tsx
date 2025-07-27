import { useWalletConnect } from "@babylonlabs-io/wallet-connector";

import { Container } from "@/ui/common/components/Container/Container";
import { useAppState } from "@/ui/common/state";

import { SmallLogo } from "../Logo/SmallLogo";
import { Connect } from "../Wallet/Connect";

export const Header = () => {
  const { open } = useWalletConnect();
  const { isLoading: loading } = useAppState();

  return (
    <header className="mb-20">
      <Container className="h-20 flex items-center justify-between">
        <SmallLogo />

        <div className="flex items-center gap-4">
          <Connect loading={loading} onConnect={open} />
        </div>
      </Container>
    </header>
  );
};
