import { IoMdClose } from "react-icons/io";
import { twJoin } from "tailwind-merge";

import { getNetworkConfig } from "@/config/network.config";
import { blocksToDisplayTime } from "@/utils/blocksToDisplayTime";
import { satoshiToBtc } from "@/utils/btcConversions";
import { maxDecimals } from "@/utils/maxDecimals";

import { LoadingView } from "../Loading/Loading";

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
  unbondingFeeSat: number;
  awaitingWalletResponse: boolean;
}

export const PreviewModal: React.FC<PreviewModalProps> = ({
  open,
  onClose,
  finalityProvider,
  stakingAmountSat,
  stakingTimeBlocks,
  onSign,
  stakingFeeSat,
  feeRate,
  unbondingFeeSat,
  awaitingWalletResponse,
}) => {
  const cardStyles =
    "card border bg-base-300 p-4 text-sm dark:border-0 dark:bg-base-200";

  const { coinName } = getNetworkConfig();

  // TODO: Get confirmation depth from params
  const confirmationDepth = 10;

  return (
    <GeneralModal
      open={open}
      onClose={onClose}
      closeOnOverlayClick={!awaitingWalletResponse}
      closeOnEsc={false}
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-bold">Preview</h3>
        {!awaitingWalletResponse && (
          <button
            className="btn btn-circle btn-ghost btn-sm"
            onClick={() => onClose(false)}
          >
            <IoMdClose size={24} />
          </button>
        )}
      </div>
      <div className="flex flex-col gap-4 text-sm">
        <div className="flex flex-col gap-4 md:flex-row">
          <div className={twJoin(cardStyles, "flex-1")}>
            <p className="text-xs dark:text-neutral-content">
              Finality Provider
            </p>
            <p>{finalityProvider || "-"}</p>
          </div>
          <div className={twJoin(cardStyles, "flex-1")}>
            <p className="text-xs dark:text-neutral-content">Stake Amount</p>
            <p>{`${maxDecimals(satoshiToBtc(stakingAmountSat), 8)} ${coinName}`}</p>
          </div>
        </div>
        <div className="flex flex-col gap-4 md:flex-row">
          <div className={twJoin(cardStyles, "flex-1")}>
            <p className="text-xs dark:text-neutral-content">Fee rate</p>
            <p>{feeRate} sat/vB</p>
          </div>
          <div className={twJoin(cardStyles, "flex-1")}>
            <p className="text-xs dark:text-neutral-content">Transaction fee</p>
            <p>{`${maxDecimals(satoshiToBtc(stakingFeeSat), 8)} ${coinName}`}</p>
          </div>
        </div>
        <div className="flex flex-col gap-4 md:flex-row">
          <div className={twJoin(cardStyles, "basis-1/5")}>
            <p className="text-xs dark:text-neutral-content">Term</p>
            <p>{blocksToDisplayTime(stakingTimeBlocks)}</p>
          </div>
          <div className={twJoin(cardStyles, "basis-2/5")}>
            <p className="text-xs dark:text-neutral-content">Slashing ratio</p>
            <p>12.3%</p>
          </div>
          <div className={twJoin(cardStyles, "basis-2/5")}>
            <p className="text-xs dark:text-neutral-content">Unbonding fee</p>
            <p>{`${maxDecimals(satoshiToBtc(unbondingFeeSat), 8)} ${coinName}`}</p>
          </div>
        </div>
        <h4 className="text-center text-base">Attention!</h4>
        <p className="dark:text-neutral-content">
          1. No third party possesses your staked {coinName}. You are the only
          one who can unbond and withdraw your stake.
        </p>
        <p className="dark:text-neutral-content">
          2. Your stake will initially have the status of &quot;Pending&quot;
          until it receives {confirmationDepth} Bitcoin confirmations.
          &quot;Pending&quot; stake is only accessible through the device it was
          created.
        </p>
        {awaitingWalletResponse ? (
          <LoadingView
            text="Awaiting wallet signature and broadcast"
            noBorder
          />
        ) : (
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
              Proceed To Signing
            </button>
          </div>
        )}
      </div>
    </GeneralModal>
  );
};
