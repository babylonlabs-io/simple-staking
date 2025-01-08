import { useWalletConnect } from "@babylonlabs-io/bbn-wallet-connect";

import { Container } from "@/app/components/Container/Container";
import { useAppState } from "@/app/state";

import { Logo } from "../Logo/Logo";
import { Connect } from "../Wallet/Connect";

export const Header = () => {
  const { open } = useWalletConnect();
  const { isLoading: loading } = useAppState();

  return (
    <header className="bg-primary-main h-[18.75rem]">
      <Container className="h-20 flex items-center justify-between">
        <Logo />
        <div className="flex items-center gap-4">
          <Connect loading={loading} onConnect={open} />
        </div>
      </Container>
    </header>
  );
};
