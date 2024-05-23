import { useRef } from "react";
import { Modal } from "react-responsive-modal";
import { IoMdClose } from "react-icons/io";

export const MODE_UNBOND = "unbond";
export const MODE_WITHDRAW = "withdraw";
export type MODE = typeof MODE_UNBOND | typeof MODE_WITHDRAW;

interface PreviewModalProps {
  open: boolean;
  onClose: (value: boolean) => void;
  onProceed: () => void;
  mode: MODE;
}

export const UnbondWithdrawModal: React.FC<PreviewModalProps> = ({
  open,
  onClose,
  onProceed,
  mode,
}) => {
  const modalRef = useRef(null);

  const unbondTitle = "Unbond";
  const unbondContent =
    `You are about to unbond your stake before its expiration. 
    The expected unbonding time will be about 10 days. After unbonded, 
    you will need to use this dashboard to withdraw your stake for it to appear 
    in your wallet. OK to proceed?`;

  const withdrawTitle = "Withdraw";
  const withdrawContent =
    "You are about to withdraw your stake. OK to proceed?";

  const title = mode === MODE_UNBOND ? unbondTitle : withdrawTitle;
  const content = mode === MODE_UNBOND ? unbondContent : withdrawContent;

  return (
    <Modal
      ref={modalRef}
      open={open}
      onClose={() => onClose(false)}
      classNames={{
        modalContainer: "flex items-end justify-center md:items-center",
        modal:
          "m-0 w-full max-w-none rounded-t-2xl bg-base-300 shadow-lg md:w-auto md:max-w-[24rem] md:rounded-b-2xl",
      }}
      showCloseIcon={false}
    >
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
    </Modal>
  );
};
