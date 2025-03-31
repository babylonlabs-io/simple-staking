import { Loader, Text } from "@babylonlabs-io/core-ui";

import { BABYLON_EXPLORER } from "@/app/constants";
import { getNetworkConfigBBN } from "@/config/network/bbn";

import { SubmitModal } from "./SubmitModal";

const { coinSymbol } = getNetworkConfigBBN();

type ClaimStatus = "processing" | "success";

interface ClaimStatusModalProps {
  open: boolean;
  onClose?: () => void;
  status: ClaimStatus;
  transactionHash?: string;
}

export const ClaimStatusModal = ({
  open,
  onClose,
  status,
  transactionHash,
}: ClaimStatusModalProps) => {
  const modalConfigs = {
    processing: {
      icon: <Loader size={48} className="text-primary-light" />,
      title: "Processing Claim",
      submitButton: "",
      cancelButton: "",
    },
    success: {
      icon: (
        <svg
          width="48"
          height="46"
          viewBox="0 0 48 46"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M47.8334 23L42.5467 16.955L43.2834 8.96L35.4617 7.18333L31.3667 0.25L24 3.41333L16.6334 0.25L12.5384 7.16167L4.71669 8.91667L5.45335 16.9333L0.166687 23L5.45335 29.045L4.71669 37.0617L12.5384 38.8383L16.6334 45.75L24 42.565L31.3667 45.7283L35.4617 38.8167L43.2834 37.04L42.5467 29.045L47.8334 23ZM19.8617 33.2267L11.6284 24.9717L14.835 21.765L19.8617 26.8133L32.5367 14.095L35.7434 17.3017L19.8617 33.2267Z"
            className="fill-primary-light"
          />
        </svg>
      ),
      title: `Successfully Claimed ${coinSymbol}`,
      submitButton: "Done",
      cancelButton: "",
    },
  };

  const config = modalConfigs[status] || modalConfigs.processing;

  const SuccessContent = () => (
    <div className="flex flex-col gap-4">
      <Text variant="body1" className="text-center">
        Your claim has been submitted and will be processed in 2 blocks.
      </Text>
      {transactionHash && (
        <div className="flex flex-col gap-2">
          <div className="flex flex-col sm:flex-row items-center justify-center">
            <Text
              variant="body2"
              className="font-semibold sm:mr-2 mb-1 sm:mb-0"
            >
              Transaction Hash:
            </Text>
            {BABYLON_EXPLORER ? (
              <a
                href={`${BABYLON_EXPLORER}/transaction/${transactionHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-light hover:text-primary-light/80 underline break-all text-sm text-center"
              >
                {transactionHash}
              </a>
            ) : (
              <Text className="break-all text-sm text-center">
                {transactionHash}
              </Text>
            )}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <SubmitModal
      open={open}
      onClose={onClose}
      onSubmit={onClose}
      icon={config.icon}
      title={config.title}
      submitButton={config.submitButton}
      cancelButton={config.cancelButton}
    >
      {status === "success" && <SuccessContent />}
    </SubmitModal>
  );
};
