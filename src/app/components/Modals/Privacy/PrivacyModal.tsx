import { IoMdClose } from "react-icons/io";

import { GeneralModal } from "../GeneralModal";

import { Privacy } from "./data/privacy";

interface PrivacyModalProps {
  open: boolean;
  onClose: (value: boolean) => void;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({
  open,
  onClose,
}) => {
  return (
    <GeneralModal open={open} onClose={onClose}>
      <div className="mb-4 flex items-center justify-between">
        <h4 className="font-bold">Privacy Policy</h4>
        <button
          className="btn btn-circle btn-ghost btn-sm"
          onClick={() => onClose(false)}
        >
          <IoMdClose size={24} />
        </button>
      </div>
      <Privacy />
    </GeneralModal>
  );
};
