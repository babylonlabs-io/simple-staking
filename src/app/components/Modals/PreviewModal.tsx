import { useRef } from "react";
import { Modal } from "react-responsive-modal";
import { IoMdClose } from "react-icons/io";

import { useTheme } from "@/app/hooks/useTheme";
import { blocksToTime } from "@/utils/blocksToTime";

interface PreviewModalProps {
  open: boolean;
  onClose: (value: boolean) => void;
  onSign: (amountSat: number, stakingTimeBlocks: number) => Promise<void>;
  finalityProvider: string | undefined;
  amountSat: number;
  stakingTimeBlocks: number;
}

export const PreviewModal: React.FC<PreviewModalProps> = ({
  open,
  onClose,
  finalityProvider,
  amountSat,
  stakingTimeBlocks,
  onSign,
}) => {
  const modalRef = useRef(null);
  const { lightSelected } = useTheme();

  const cardStyles =
    "card border bg-base-300 p-4 text-sm dark:border-0 dark:bg-base-200";

  return (
    <Modal
      ref={modalRef}
      open={open}
      onClose={() => onClose(false)}
      classNames={{
        root: `${lightSelected ? "light" : "dark"}`,
        modalContainer: "flex items-end justify-center md:items-center",
        modal:
          "m-0 w-full max-w-none rounded-t-2xl bg-base-300 shadow-lg md:w-auto md:max-w-[45rem] md:rounded-b-2xl lg:max-w-[55rem]",
      }}
      showCloseIcon={false}
    >
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
        <div className="flex gap-4">
          <div className={`${cardStyles} flex-1`}>
            <p className="text-xs dark:text-neutral-content">
              Finality Provider
            </p>
            <p>{finalityProvider || "-"}</p>
          </div>
          <div className={`${cardStyles} flex-1`}>
            <p className="text-xs dark:text-neutral-content">Amount</p>
            <p>{`${+(amountSat / 1e8).toFixed(6)} Signet BTC`}</p>
          </div>
        </div>
        <div className="flex gap-4">
          <div className={`${cardStyles} basis-1/5`}>
            <p className="text-xs dark:text-neutral-content">Term</p>
            <p>{blocksToTime(stakingTimeBlocks)}</p>
          </div>
          <div className={`${cardStyles} basis-4/5`}>
            <p className="text-xs dark:text-neutral-content">
              On-demand unbonding
            </p>
            <p>Enabled (10 days unbonding time)</p>
          </div>
        </div>
        <h4 className="text-center text-base">Attention!</h4>
        <p className="dark:text-neutral-content">
          1. There is a delay between the actual TVL and its display in this
          dashboard. The current staking cap may already be filled when your
          staking transaction is included in the Bitcoin chain. In that case,
          the dashboard will mark your stake as &quot;overflow&quot; and request
          you to unbond and withdraw, which will cause extra transaction fees.
          Therefore please stake wisely.
        </p>
        <p className="dark:text-neutral-content">
          2. No third party possesses your staked Signet BTC. You are the only
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
          <button
            className="btn-primary btn flex-1"
            onClick={() => onSign(amountSat, stakingTimeBlocks)}
          >
            Stake
          </button>
        </div>
      </div>
    </Modal>
  );
};
