import { Text } from "@babylonlabs-io/core-ui";

import { getNetworkConfig } from "@/ui/common/config/network";

import { SubmitModal } from "../SubmitModal";

interface RegistrationEndModalProps {
  open: boolean;
  onClose: () => void;
}

const SuccessIcon = () => (
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
);

const { bbn } = getNetworkConfig();

export function RegistrationEndModal({
  open,
  onClose,
}: RegistrationEndModalProps) {
  return (
    <SubmitModal
      open={open}
      onClose={onClose}
      onSubmit={onClose}
      icon={<SuccessIcon />}
      title="Registration Submitted"
      submitButton="Done"
      cancelButton=""
    >
      <Text variant="body1" className="text-center">
        Your staking transaction has been successfully registered to the{" "}
        {bbn.networkFullName}.
      </Text>
    </SubmitModal>
  );
}
