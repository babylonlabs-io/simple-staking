import { IoMdClose } from "react-icons/io";

import { blocksToWeeks } from "@/utils/blocksToWeeks";
import { satoshiToBtc } from "@/utils/btcConversions";
import { maxDecimals } from "@/utils/maxDecimals";
import { GeneralModal } from "./GeneralModal";
import { getNetworkConfig } from "@/config/network.config";

interface PreviewModalProps {
  open: boolean;
  onClose: (value: boolean) => void;
  onSign: () => void;
  finalityProvider: string | undefined;
  stakingAmountSat: number;
  stakingTimeBlocks: number;
}

export const PreviewModal: React.FC<PreviewModalProps> = ({
  open,
  onClose,
  finalityProvider,
  stakingAmountSat,
  stakingTimeBlocks,
  onSign,
}) => {
  const cardStyles =
    "card border bg-base-300 p-4 text-sm dark:border-0 dark:bg-base-200";

  const { coinName } = getNetworkConfig();

  return (
    <GeneralModal open={open} onClose={onClose}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-bold">Preview</h3>
        <button
          className="btn btn-circle btn-ghost btn-sm"
          onClick={() => onClose(false)}
        >
          <IoMdClose size={24} />
        </button>
      </div>
      <div className="flex flex-col gap-4 text-sm">
        <div className="flex flex-col gap-4 md:flex-row">
          <div className={`${cardStyles} flex-1`}>
            <p className="text-xs dark:text-neutral-content">
              Finality Provider
            </p>
            <p>{finalityProvider || "-"}</p>
          </div>
          <div className={`${cardStyles} flex-1`}>
            <p className="text-xs dark:text-neutral-content">Amount</p>
            <p>{`${maxDecimals(satoshiToBtc(stakingAmountSat), 8)} ${coinName}`}</p>
          </div>
        </div>
        <div className="flex flex-col gap-4 md:flex-row">
          <div className={`${cardStyles} basis-1/5`}>
            <p className="text-xs dark:text-neutral-content">Term</p>
            <p>{blocksToWeeks(stakingTimeBlocks, 5)}</p>
          </div>
          <div className={`${cardStyles} basis-4/5`}>
            <p className="text-xs dark:text-neutral-content">
              On-demand unbonding
            </p>
            <p>Enabled (7 days unbonding time)</p>
          </div>
        </div>
        <h4 className="text-center text-base">Attention!</h4>
        <p className="dark:text-neutral-content">
          1. Your stake may &quot;overflow&quot; the staking TVL cap and need to
          be unbonded and withdrawn, which will cost you extra transaction fees.
          So please stake wisely.
        </p>
        <p className="dark:text-neutral-content">
          2. No third party possesses your staked {coinName}. You are the only
          one who can unbond and withdraw your stake.
        </p>
        <div className="flex gap-4">
          <button
            className="btn btn-outline flex-1"
            onClick={() => {
              onClose(false);
            }}
          >
            Cancel
          </button>
          <button className="btn-primary btn flex-1" onClick={onSign}>
            Stake
          </button>
        </div>
      </div>
    </GeneralModal>
  );
};
