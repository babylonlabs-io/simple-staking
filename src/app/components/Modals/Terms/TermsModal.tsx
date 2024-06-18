import { IoMdClose } from "react-icons/io";

import { GeneralModal } from "../GeneralModal";

import { Terms } from "./data/terms";

interface TermsModalProps {
  open: boolean;
  onClose: (value: boolean) => void;
}

export const TermsModal: React.FC<TermsModalProps> = ({ open, onClose }) => {
  return (
    <GeneralModal open={open} onClose={onClose}>
      <div className="mb-4 flex items-center justify-between">
        <h4 className="font-bold">Terms of Use</h4>
        <button
          className="btn btn-circle btn-ghost btn-sm"
          onClick={() => onClose(false)}
        >
          <IoMdClose size={24} />
        </button>
      </div>
      <Terms />
    </GeneralModal>
  );
};
