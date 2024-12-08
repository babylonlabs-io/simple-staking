import { Text } from "@babylonlabs-io/bbn-core-ui";
import { useWalletConnect } from "@babylonlabs-io/bbn-wallet-connect";
import Image from "next/image";

import bitcoin from "@/app/assets/bitcoin.png";
import bbnIcon from "@/app/assets/icon-black.svg";
import { useBTCWallet } from "@/app/context/wallet/BTCWalletProvider";
import { useAppState } from "@/app/state";

import { Hash } from "../Hash/Hash";
import { ThemeToggle } from "../ThemeToggle/ThemeToggle";
import { Toggle } from "../Toggle/Toggle";

interface MenuProps {
  open: boolean;
  onClose: () => void;
}

export const Menu: React.FC<MenuProps> = ({ open, onClose }) => {
  const { ordinalsExcluded, includeOrdinals, excludeOrdinals } = useAppState();
  const { disconnect } = useWalletConnect();
  const { address } = useBTCWallet();

  if (!open) {
    return null;
  }

  return (
    <div
      className="absolute right-[10px] top-0 z-10 mt-[4.5rem] flex flex-col gap-4 rounded bg-secondary-contrast p-4 border border-primary-light/20"
      style={{
        // margin - border
        width: "calc(100% - 8px)",
      }}
    >
      <div className="flex flex-row gap-4">
        <Image src={bitcoin} alt="bitcoin" width={40} height={40} />
        <div className="flex flex-col">
          <Text variant="body1" className="text-primary-dark text-base">
            Bitcoin
          </Text>
          <Hash value={address} address noFade fullWidth />
        </div>
      </div>
      <div className="flex flex-row items-center justify-between">
        <Text variant="body2" className="text-sm text-primary-dark">
          Not using Inscriptions
        </Text>
        <div>
          <Toggle disabled={true} />
        </div>
      </div>
      <div className="divider" />
      <div className="flex flex-row gap-4">
        <Image src={bbnIcon} alt="bitcoin" width={40} height={40} />
        <div className="flex flex-col">
          <Text variant="body1" className="text-primary-dark text-base">
            Babylon Chain
          </Text>
          <Hash value={address} address noFade fullWidth />
        </div>
      </div>
      <div className="divider" />
      <div className="flex items-center justify-start">
        <button
          className="text-sm text-secondary-main"
          onClick={() => {
            onClose();
            disconnect();
          }}
        >
          Disconnect Wallets
        </button>
      </div>
      <div className="divider" />
      <div>
        <ThemeToggle />
      </div>
    </div>
  );
};
