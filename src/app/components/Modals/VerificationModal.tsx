import { Loader } from "@babylonlabs-io/bbn-core-ui";

import { getNetworkConfigBTC } from "@/config/network/btc";

import { SubmitModal } from "./SubmitModal";

interface VerificationModalProps {
  processing: boolean;
  open: boolean;
}

const { networkName } = getNetworkConfigBTC();

export const VerificationModal = ({
  processing,
  open,
}: VerificationModalProps) => (
  <SubmitModal
    processing={processing}
    open={open}
    icon={<Loader size={48} />}
    title="Pending Verification"
    submitButton={`Stake on ${networkName}`}
    onSubmit={() => {}}
  >
    The babylon blockchain has received your request. Please wait while we
    confirm the neseccary amount of signatures
  </SubmitModal>
);
