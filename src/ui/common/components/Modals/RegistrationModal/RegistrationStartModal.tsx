import { Text } from "@babylonlabs-io/core-ui";
import { BiSolidEditAlt } from "react-icons/bi";

import { getNetworkConfigBBN } from "@/ui/common/config/network/bbn";
import { getNetworkConfigBTC } from "@/ui/common/config/network/btc";

import { SubmitModal } from "../SubmitModal";

interface RegistrationStartModalProps {
  open: boolean;
  onClose: () => void;
  onProceed?: () => void;
}

const { networkName } = getNetworkConfigBTC();
const { networkFullName } = getNetworkConfigBBN();

export function RegistrationStartModal({
  open,
  onClose,
  onProceed,
}: RegistrationStartModalProps) {
  return (
    <SubmitModal
      open={open}
      onClose={onClose}
      onSubmit={onProceed}
      icon={<BiSolidEditAlt size={52} className="text-primary-light" />}
      title={`Register to ${networkFullName}`}
      submitButton="Proceed"
    >
      <Text variant="body1" className="text-center">
        You are about to register your {networkName} stake to the{" "}
        {networkFullName}. The registration requires consenting to slashing and
        the association of your {networkFullName} account with your{" "}
        {networkName} address.
      </Text>
    </SubmitModal>
  );
}
