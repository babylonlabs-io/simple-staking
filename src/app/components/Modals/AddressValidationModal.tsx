import { IoMdClose } from "react-icons/io";

import { GeneralModal } from "./GeneralModal";

interface ModalProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: () => void;
}

export function AddressValidationModal({
  open,
  onCancel,
  onSubmit,
}: ModalProps) {
  return (
    <GeneralModal small open={open} onClose={onCancel}>
      <div className="flex items-center justify-end">
        <button className="btn btn-circle btn-ghost btn-sm" onClick={onCancel}>
          <IoMdClose size={24} />
        </button>
      </div>
      <div className="flex flex-col justify-center gap-4">
        <h3 className="text-center font-bold text-error">
          Public Key Mismatch
        </h3>
        <div className="flex flex-col gap-3">
          <p className="text-center">
            The Bitcoin address and Public Key for this wallet do not match.
            Please contact your wallet provider for support.
          </p>
        </div>
        <div className="mt-4 flex justify-around gap-4">
          <button
            className="btn btn-outline flex-1 rounded-lg px-2"
            onClick={onCancel}
          >
            Cancel
          </button>

          <button
            className="btn-primary btn flex-1 rounded-lg px-2 text-white"
            onClick={onSubmit}
          >
            Continue
          </button>
        </div>
      </div>
    </GeneralModal>
  );
}
