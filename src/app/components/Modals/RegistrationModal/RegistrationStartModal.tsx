import { Text } from "@babylonlabs-io/bbn-core-ui";
import Image from "next/image";

import editIcon from "@/app/assets/edit.svg";
import { getNetworkConfigBBN } from "@/config/network/bbn";
import { getNetworkConfigBTC } from "@/config/network/btc";

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
  const icon = (
    <div className="relative w-11 h-12">
      <Image src={editIcon} alt="Register" fill />
    </div>
  );

  return (
    <SubmitModal
      open={open}
      onClose={onClose}
      onSubmit={onProceed}
      icon={icon}
      title={`Register to ${networkFullName}`}
      submitButton="Proceed"
    >
      <Text variant="body1" className="text-center">
        You are about to register your {networkName} stake to the{" "}
        {networkFullName}. The registration requires consenting to slashing and
        the association of your {networkFullName} testnet account with your{" "}
        {networkName} address.
      </Text>
    </SubmitModal>
  );
}
