import { useEffect, useState } from "react";
import { IoMdClose } from "react-icons/io";

import { LoadingView } from "@/app/components/Loading/Loading";

import { GeneralModal } from "./GeneralModal";

interface TermsModalProps {
  open: boolean;
  onClose: (value: boolean) => void;
}

export const TermsModal: React.FC<TermsModalProps> = ({ open, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [googleDocsViewerUrl, setGoogleDocsViewerUrl] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (open) {
      setLoading(true);
      if (typeof window !== "undefined") {
        const url = `https://docs.google.com/viewer?url=${encodeURIComponent(
          `${window.location.origin}/babylonchain_terms_of_use.doc`,
        )}&embedded=true`;
        setGoogleDocsViewerUrl(url);
      }
    }
  }, [open]);

  const handleIframeLoad = () => {
    setLoading(false);
  };

  const handleIframeError = () => {
    setLoading(false);
  };

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
      {open && googleDocsViewerUrl && (
        <iframe
          src={googleDocsViewerUrl}
          width="100%"
          title="Terms of Use"
          onLoad={handleIframeLoad}
          onError={handleIframeError}
          style={{ display: loading ? "none" : "block" }}
          className="min-h-[25rem] rounded-xl"
        ></iframe>
      )}
      <div className="mt-4">
        <a href="/babylonchain_terms_of_use.doc" download>
          <button className="btn-primary btn h-[2.5rem] min-h-[2.5rem] rounded-lg px-2 text-white w-full">
            Download Terms of Use
          </button>
        </a>
      </div>
    </GeneralModal>
  );
};
