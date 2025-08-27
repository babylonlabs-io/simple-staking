import { Avatar, Copy, Loader, Text } from "@babylonlabs-io/core-ui";

import bbnIcon from "@/ui/common/assets/bbn.svg";
import { Hint } from "@/ui/common/components/Common/Hint";
import { Hash } from "@/ui/common/components/Hash/Hash";
import { CopyIcon } from "@/ui/common/components/Icons";
import { getNetworkConfigBBN } from "@/ui/common/config/network/bbn";
import { getNetworkConfigBTC } from "@/ui/common/config/network/btc";
import { useUTXOs } from "@/ui/common/hooks/client/api/useUTXOs";
import { useBalanceState } from "@/ui/common/state/BalanceState";
import { useRewardsState } from "@/ui/common/state/RewardState";
import { ubbnToBaby } from "@/ui/common/utils/bbn";
import { satoshiToBtc } from "@/ui/common/utils/btc";

interface WalletInfoProps {
  btcAddress: string;
  bbnAddress: string;
  selectedWallets: Record<string, { name: string; icon: string }>;
}

const { icon, coinSymbol } = getNetworkConfigBTC();
const { coinSymbol: bbnCoinSymbol } = getNetworkConfigBBN();

export const WalletInfoSection = ({
  btcAddress,
  bbnAddress,
  selectedWallets,
}: WalletInfoProps) => {
  const { processing } = useRewardsState();

  const {
    bbnBalance,
    stakableBtcBalance,
    stakedBtcBalance,
    inscriptionsBtcBalance,
    loading: isBalanceLoading,
  } = useBalanceState();

  const { allUTXOs = [], confirmedUTXOs = [] } = useUTXOs();
  const hasUnconfirmedUTXOs = allUTXOs.length > confirmedUTXOs.length;

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Bitcoin Wallet */}
      <div className="bg-secondary-highlight dark:bg-secondary-strokeLight rounded-[4px] p-4">
        <div className="flex flex-col w-full">
          <div className="flex justify-start mb-3 gap-2">
            <Avatar
              alt={selectedWallets["BTC"]?.name || "Bitcoin"}
              url={selectedWallets["BTC"]?.icon || icon}
              size="large"
              className="w-10 h-10"
            />
            <div className="flex flex-col justify-between">
              <div className="flex mb-[1px]">
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
                <Copy
                  value={btcAddress}
                  className="cursor-pointer ml-2 hover:opacity-80"
                  copiedText="✓"
                >
                  <CopyIcon size={12} />
                </Copy>
              </div>
            </div>
          </div>

          <div className="flex flex-col mb-1">
            <Text
              variant="body1"
              className="text-accent-secondary font-medium text-xs"
            >
              Staked Balance
            </Text>
            {isBalanceLoading ? (
              <Loader />
            ) : (
              <Text variant="body1" className="text-accent-primary text-sm">
                {`${satoshiToBtc(stakedBtcBalance)} ${coinSymbol}`}
              </Text>
            )}
          </div>

          <div className="flex flex-col">
            <Text
              variant="body1"
              className="text-accent-secondary font-medium text-xs"
            >
              Stakable Balance
            </Text>
            {!(isBalanceLoading || hasUnconfirmedUTXOs) && (
              <Hint
                tooltip={
                  inscriptionsBtcBalance
                    ? `You have ${satoshiToBtc(inscriptionsBtcBalance)} ${coinSymbol} that contains inscriptions. To use this in your stakable balance unlock them within the menu.`
                    : undefined
                }
              >
                <Text variant="body1" className="text-accent-primary text-sm">
                  {`${satoshiToBtc(stakableBtcBalance)} ${coinSymbol}`}
                </Text>
              </Hint>
            )}
            {(isBalanceLoading || hasUnconfirmedUTXOs) && <Loader />}
          </div>
        </div>
      </div>

      {/* Babylon Wallet */}
      <div className="bg-secondary-highlight dark:bg-secondary-strokeLight rounded p-4">
        <div className="flex flex-col w-full">
          <div className="flex justify-start mb-3 gap-2">
            <Avatar
              alt={selectedWallets["BBN"]?.name || "Babylon"}
              url={selectedWallets["BBN"]?.icon || bbnIcon}
              size="large"
              className="w-10 h-10"
            />
            <div className="flex flex-col justify-between">
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
                <Copy
                  value={bbnAddress}
                  className="cursor-pointer ml-2 hover:opacity-80"
                  copiedText="✓"
                >
                  <CopyIcon size={12} />
                </Copy>
              </div>
            </div>
          </div>

          <div className="flex flex-col">
            <Text
              variant="body1"
              className="text-accent-secondary font-medium text-xs"
            >
              Balance
            </Text>
            {isBalanceLoading || processing ? (
              <Loader />
            ) : (
              <Text variant="body1" className="text-accent-primary text-sm">
                {`${ubbnToBaby(bbnBalance)} ${bbnCoinSymbol}`}
              </Text>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
