import { useEffect, useState } from "react";
import { IoMdClose } from "react-icons/io";

import { LoadingView } from "@/app/components/Loading/Loading";

import { GeneralModal } from "../GeneralModal";

import { Terms } from "./data/terms";

interface TermsModalProps {
  open: boolean;
  onClose: (value: boolean) => void;
}

export const TermsModal: React.FC<TermsModalProps> = ({ open, onClose }) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open) {
      setLoading(false);
    }
  }, [open]);

  return (
    <GeneralModal open={open} onClose={onClose}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-bold">Terms of Use</h3>
        <button
          className="btn btn-circle btn-ghost btn-sm"
          onClick={() => onClose(false)}
        >
          <IoMdClose size={24} />
        </button>
      </div>
      {loading && <LoadingView />}
      {!loading && <Terms />}
    </GeneralModal>
  );
};
