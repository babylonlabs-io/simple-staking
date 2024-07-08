import { IoMdClose } from "react-icons/io";

import { getNetworkConfig } from "@/config/network.config";
import { blocksToDisplayTime } from "@/utils/blocksToDisplayTime";
import { satoshiToBtc } from "@/utils/btcConversions";
import { maxDecimals } from "@/utils/maxDecimals";

import { GeneralModal } from "./GeneralModal";

interface PreviewModalProps {
  open: boolean;
  onClose: (value: boolean) => void;
  onSign: () => void;
  finalityProvider: string | undefined;
  stakingAmountSat: number;
  stakingTimeBlocks: number;
  stakingFeeSat: number;
  feeRate: number;
  unbondingTimeBlocks: number;
}

export const PreviewModal: React.FC<PreviewModalProps> = ({
  open,
  onClose,
  finalityProvider,
  stakingAmountSat,
  stakingTimeBlocks,
  unbondingTimeBlocks,
  onSign,
  stakingFeeSat,
  feeRate,
}) => {
  const cardStyles = "bg-black px-4 py-3 flex flex-col";

  const { coinName } = getNetworkConfig();

  return (
    <GeneralModal open={open} onClose={onClose}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold text-xl uppercase">Preview</h3>
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
            <p className="uppercase text-md text-es-text-secondary">
              Finality Provider
            </p>
            <p className="text-base text-white font-medium">
              {finalityProvider || "-"}
            </p>
          </div>
          <div className={`${cardStyles} flex-1`}>
            <p className="uppercase text-md text-es-text-secondary">Amount</p>
            <p className="text-base text-white font-medium">{`${maxDecimals(satoshiToBtc(stakingAmountSat), 8)} ${coinName}`}</p>
          </div>
        </div>
        <div className="flex flex-col gap-4 md:flex-row">
          <div className={`${cardStyles} flex-1`}>
            <p className="uppercase text-md text-es-text-secondary">Fee rate</p>
            <p className="text-base text-white font-medium">{feeRate} sat/vB</p>
          </div>
          <div className={`${cardStyles} flex-1`}>
            <p className="uppercase text-md text-es-text-secondary">
              Transaction fee
            </p>
            <p className="text-base text-white font-medium">{`${maxDecimals(satoshiToBtc(stakingFeeSat), 8)} ${coinName}`}</p>
          </div>
        </div>
        <div className="flex flex-col gap-4 md:flex-row">
          <div className={`${cardStyles} basis-1/5`}>
            <p className="uppercase text-md text-es-text-secondary">Term</p>
            <p className="text-base text-white font-medium">
              {blocksToDisplayTime(stakingTimeBlocks)}
            </p>
          </div>
          <div className={`${cardStyles} basis-4/5`}>
            <p className="uppercase text-md text-es-text-secondary">
              On-demand unbonding
            </p>
            <p className="text-base text-white font-medium">
              Enabled ({blocksToDisplayTime(unbondingTimeBlocks)} unbonding
              time)
            </p>
          </div>
        </div>
        <h4 className="font-semibold text-xl uppercase text-center">
          Attention!
        </h4>
        <p className="text-medium text-sm text-es-text-hint">
          1. Your stake may &quot;overflow&quot; the staking TVL cap and need to
          be unbonded and withdrawn, which will cost you extra transaction fees.
          So please stake wisely.
        </p>
        <p className="text-medium text-sm text-es-text-hint">
          2. No third party possesses your staked {coinName}. You are the only
          one who can unbond and withdraw your stake.
        </p>
        <div className="flex gap-4">
          <button
            className="es-button-secondary"
            onClick={() => {
              onClose(false);
            }}
          >
            Cancel
          </button>
          <button className="es-button" onClick={onSign}>
            Stake
          </button>
        </div>
      </div>
    </GeneralModal>
  );
};
