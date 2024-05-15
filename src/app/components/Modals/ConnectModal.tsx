import { useRef, useState } from "react";
import { Modal } from "react-responsive-modal";
import { IoMdClose } from "react-icons/io";
import { PiWalletBold } from "react-icons/pi";

import { useTheme } from "@/app/hooks/useTheme";

interface ConnectModalProps {
  open: boolean;
  onClose: (value: boolean) => void;
  onConnect: () => void;
  connectDisabled: boolean;
}

export const ConnectModal: React.FC<ConnectModalProps> = ({
  open,
  onClose,
  onConnect,
  connectDisabled,
}) => {
  const modalRef = useRef(null);
  const { lightSelected } = useTheme();

  const [accepted, setAccepted] = useState(false);

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
        <h3 className="font-bold">Connect wallet</h3>
        <button
          className="btn btn-circle btn-ghost btn-sm"
          onClick={() => onClose(false)}
        >
          <IoMdClose size={24} />
        </button>
      </div>
      <div className="flex flex-col justify-center gap-4">
        <div className="form-control">
          <label className="label cursor-pointer justify-start gap-2">
            <input
              type="checkbox"
              className="checkbox-primary checkbox"
              onChange={(e) => setAccepted(e.target.checked)}
              checked={accepted}
            />
            <span className="label-text">
              I certify that I have read and accept the updated{" "}
              <a
                href="/babylonchain_terms_of_use.doc"
                target="_blank"
                rel="noopener noreferrer"
                className="sublink text-primary hover:underline"
              >
                Terms of Use
              </a>
              .
            </span>
          </label>
        </div>
        <button
          className="btn-primary btn h-[2.5rem] min-h-[2.5rem] rounded-lg px-2 text-white"
          onClick={onConnect}
          disabled={connectDisabled || !accepted}
        >
          <PiWalletBold size={20} />
          Connect to BTC signet network
        </button>
      </div>
    </Modal>
  );
};
