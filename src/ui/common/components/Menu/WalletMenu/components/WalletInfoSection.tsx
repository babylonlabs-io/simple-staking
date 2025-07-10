import { Avatar, Text } from "@babylonlabs-io/core-ui";

import bbnIcon from "@/ui/common/assets/bbn.svg";
import bitcoin from "@/ui/common/assets/bitcoin.png";
import { DisplayHash } from "@/ui/common/components/Hash";
import { CopyIcon } from "@/ui/common/components/Icons";
import { useCopy } from "@/ui/common/hooks/useCopy";

interface WalletInfoProps {
  btcAddress: string;
  bbnAddress: string;
  selectedWallets: Record<string, { name: string; icon: string }>;
}

export const WalletInfoSection = ({
  btcAddress,
  bbnAddress,
  selectedWallets,
}: WalletInfoProps) => {
  const { copyToClipboard, isCopied } = useCopy();

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Bitcoin Wallet */}
      <div className="bg-secondary-highlight dark:bg-secondary-strokeLight rounded-[4px] p-4">
        <div className="flex flex-col w-full">
          <div className="flex justify-start mb-3">
            <Avatar
              alt={selectedWallets["BTC"]?.name || "Bitcoin"}
              url={selectedWallets["BTC"]?.icon || bitcoin}
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
            {isCopied("btc") ? (
              <Text className="text-accent-primary text-sm flex-1 min-w-0">
                Copied ✓
              </Text>
            ) : (
              <DisplayHash
                className="text-accent-primary text-sm flex-1 min-w-0"
                value={btcAddress}
                symbols={12}
              />
            )}
            <button
              onClick={() => copyToClipboard("btc", btcAddress)}
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
            {isCopied("bbn") ? (
              <Text className="text-accent-primary text-sm flex-1 min-w-0">
                Copied ✓
              </Text>
            ) : (
              <DisplayHash
                className="text-accent-primary text-sm flex-1 min-w-0"
                value={bbnAddress}
                symbols={12}
              />
            )}
            <button
              onClick={() => copyToClipboard("bbn", bbnAddress)}
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
