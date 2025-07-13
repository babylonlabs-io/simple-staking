import { useWalletConnect } from "@babylonlabs-io/wallet-connector";
import { Link, useLocation } from "react-router";
import { twJoin } from "tailwind-merge";

import { Container } from "@/ui/common/components/Container/Container";
import { useAppState } from "@/ui/common/state";

import { SmallLogo } from "../Logo/SmallLogo";
import { Connect } from "../Wallet/Connect";

export const Header = () => {
  const { open } = useWalletConnect();
  const { isLoading: loading } = useAppState();

  const { pathname } = useLocation();

  return (
    <header className="h-[18.75rem]">
      <Container className="h-20 grid grid-cols-3 items-center">
        <div className="flex justify-start">
          <SmallLogo />
        </div>

        <nav className="flex gap-6 justify-center items-center">
          <Link
            to="/btc"
            className={twJoin(
              "w-32 h-10 text-center whitespace-nowrap flex items-center justify-center",
              pathname.startsWith("/btc")
                ? "text-accent-primary"
                : "text-accent-secondary",
            )}
          >
            BTC Staking
          </Link>
          <Link
            to="/baby"
            className={twJoin(
              "w-32 h-10 text-center whitespace-nowrap flex items-center justify-center",
              pathname.startsWith("/baby")
                ? "text-accent-primary"
                : "text-accent-secondary",
            )}
          >
            BABY Staking
          </Link>
        </nav>

        <div className="flex justify-end items-center gap-4">
          <Connect loading={loading} onConnect={open} />
        </div>
      </Container>
    </header>
  );
};
