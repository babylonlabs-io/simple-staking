import { IoMdClose } from "react-icons/io";

import { blocksToDisplayTime } from "@/utils/blocksToDisplayTime";

import { GeneralModal } from "./GeneralModal";

export const MODE_UNBOND = "unbond";
export const MODE_WITHDRAW = "withdraw";
export type MODE = typeof MODE_UNBOND | typeof MODE_WITHDRAW;

interface PreviewModalProps {
  unbondingTimeBlocks: number;
  open: boolean;
  onClose: (value: boolean) => void;
  onProceed: () => void;
  mode: MODE;
}

export const UnbondWithdrawModal: React.FC<PreviewModalProps> = ({
  unbondingTimeBlocks,
  open,
  onClose,
  onProceed,
  mode,
}) => {
  const unbondTitle = "Unbond";
  const unbondContent = (
    <>
      You are about to unbond your stake before its expiration. The expected
      unbonding time will be about{" "}
      <strong>
        {unbondingTimeBlocks ? blocksToDisplayTime(unbondingTimeBlocks) : "-"}
      </strong>
      .<br />
      After unbonded, you will need to use this dashboard to withdraw your stake
      for it to appear in your wallet.
    </>
  );

  const withdrawTitle = "Withdraw";
  const withdrawContent = "You are about to withdraw your stake.";

  const title = mode === MODE_UNBOND ? unbondTitle : withdrawTitle;
  const content = mode === MODE_UNBOND ? unbondContent : withdrawContent;

  return (
    <GeneralModal open={open} onClose={onClose} small>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-bold">{title}</h3>
        <button
          className="btn btn-circle btn-ghost btn-sm"
          onClick={() => onClose(false)}
        >
          <IoMdClose size={24} />
        </button>
      </div>
      <div className="flex flex-col gap-4">
        <p className="text-center dark:text-neutral-content">{content}</p>
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
            onClick={() => {
              onClose(false);
              onProceed();
            }}
          >
            Proceed
          </button>
        </div>
      </div>
    </GeneralModal>
  );
};
