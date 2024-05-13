import { useRef } from "react";
import { Modal } from "react-responsive-modal";
import { IoMdClose } from "react-icons/io";

import { useTheme } from "@/app/hooks/useTheme";

interface PreviewModalProps {
  open: boolean;
  onClose: (value: boolean) => void;
  onProceed: () => void;
  mode: "unbond" | "withdraw";
}

export const UnbondWithdrawModal: React.FC<PreviewModalProps> = ({
  open,
  onClose,
  onProceed,
  mode,
}) => {
  const modalRef = useRef(null);
  const { lightSelected } = useTheme();

  const unbondTitle = "Unbond";
  const unbondContent =
    "You are going to request stake unbonding before your stake expires. The expected approval and unbond time will be about 10 days. OK to proceed?";

  const withdrawTitle = "Withdraw";
  const withdrawContent =
    "You are about to withdraw your stake back to your own address. OK to proceed?";

  const title = mode === "unbond" ? unbondTitle : withdrawTitle;
  const content = mode === "unbond" ? unbondContent : withdrawContent;

  return (
    <Modal
      ref={modalRef}
      open={open}
      onClose={() => onClose(false)}
      classNames={{
        root: `${lightSelected ? "light" : "dark"}`,
        modalContainer: "flex items-end justify-center md:items-center",
        modal:
          "m-0 w-full max-w-none rounded-t-2xl bg-base-300 shadow-lg md:w-auto md:w-[24rem] md:rounded-b-2xl",
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
