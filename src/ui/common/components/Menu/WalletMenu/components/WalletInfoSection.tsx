import { Avatar, Text } from "@babylonlabs-io/core-ui";

import bbnIcon from "@/ui/common/assets/bbn.svg";
import { Hash } from "@/ui/common/components/Hash/Hash";
import { CopyIcon } from "@/ui/common/components/Icons";
import { getNetworkConfigBTC } from "@/ui/common/config/network/btc";

interface WalletInfoProps {
  btcAddress: string;
  bbnAddress: string;
  selectedWallets: Record<string, { name: string; icon: string }>;
}

const { icon } = getNetworkConfigBTC();

export const WalletInfoSection = ({
  btcAddress,
  bbnAddress,
  selectedWallets,
}: WalletInfoProps) => {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Bitcoin Wallet */}
      <div className="bg-secondary-highlight dark:bg-secondary-strokeLight rounded-[4px] p-4">
        <div className="flex flex-col w-full">
          <div className="flex justify-start mb-3">
            <Avatar
              alt={selectedWallets["BTC"]?.name || "Bitcoin"}
              url={selectedWallets["BTC"]?.icon || icon}
              size="large"
              className="w-10 h-10"
            />
          </div>

          <div className="flex justify-start mb-[1px]">
            <Text
              variant="body1"
              className="text-accent-secondary font-medium text-xs"
            >
              Bitcoin Wallet
            </Text>
          </div>

          <div className="flex items-center justify-between w-full">
            <Hash
              className="text-accent-primary text-sm flex-1 min-w-0"
              value={btcAddress}
              address
              noFade
              symbols={12}
              noCopy
            />
            <button
              onClick={() => copyToClipboard(btcAddress)}
              className="flex-shrink-0 ml-3 p-1 rounded hover:bg-surface-tertiary transition-colors h-6 w-6 flex items-center justify-center hover:opacity-80"
            >
              <CopyIcon size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Babylon Wallet */}
      <div className="bg-secondary-highlight dark:bg-secondary-strokeLight rounded p-4">
        <div className="flex flex-col w-full">
          <div className="flex justify-start mb-3">
            <Avatar
              alt={selectedWallets["BBN"]?.name || "Babylon"}
              url={selectedWallets["BBN"]?.icon || bbnIcon}
              size="large"
              className="w-10 h-10"
            />
          </div>

          <div className="flex justify-start mb-[1px]">
            <Text
              variant="body1"
              className="text-accent-secondary font-medium text-xs"
            >
              Babylon Wallet
            </Text>
          </div>

          <div className="flex items-center justify-between w-full">
            <Hash
              className="text-accent-primary text-sm flex-1 min-w-0"
              value={bbnAddress}
              address
              noFade
              symbols={12}
              noCopy
            />
            <button
              onClick={() => copyToClipboard(bbnAddress)}
              className="flex-shrink-0 ml-3 p-1 rounded hover:bg-surface-tertiary transition-colors h-6 w-6 flex items-center justify-center hover:opacity-80"
            >
              <CopyIcon size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
