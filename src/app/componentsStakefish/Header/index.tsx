import { useWalletConnect } from "@babylonlabs-io/wallet-connector";
import Link from "next/link";

import { Connect } from "@/app/components/Wallet/Connect";
import { useAppState } from "@/app/state";
import { Header as HeaderComponent } from "@/ui";
import { WEBSITE_URL } from "@/utils/stakefish";

import { NetworkDropdown } from "./NetworkDropdown";
import { ThemeToggler } from "./ThemeToggler";

export const Header = () => {
  const { isLoading: loading } = useAppState();
  const { open } = useWalletConnect();

  const actionContent = (
    <div className="flex items-center gap-2">
      <div className="flex items-center justify-center gap-2">
        <ThemeToggler
          buttonProps={{
            variant: "outline",
            color: "secondary",
            className: "ring-1 ring-inset !p-2",
          }}
        />
      </div>
      <div className="flex items-center gap-2 relative">
        <NetworkDropdown />
        <Connect loading={loading} onConnect={open} />
      </div>
    </div>
  );

  return (
    <HeaderComponent
      filled
      bordered
      pictogramOnly
      ElementLogo={Link}
      actionsContent={actionContent}
      className="w-screen py-2"
      logoUrl={`${WEBSITE_URL}/`}
    />
  );
};
