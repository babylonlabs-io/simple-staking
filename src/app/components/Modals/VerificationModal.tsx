import { Loader } from "@babylonlabs-io/bbn-core-ui";

import { getNetworkConfigBTC } from "@/config/network/btc";

import { SubmitModal } from "./SubmitModal";

interface VerificationModalProps {
  processing: boolean;
  open: boolean;
  step: 1 | 2;
}

const { networkName } = getNetworkConfigBTC();

const VERIFICATION_STEPS = {
  1: {
    title: (
      <>
        1/2 <br /> Processing Confirmation
      </>
    ),
    description:
      "Waiting for the staking confirmation to be confirmed on Babylon chain.",
  },
  2: {
    title: (
      <>
        2/2 <br /> Pending Verification
      </>
    ),
    description: "The Babylon chain is verifying your staking transaction.",
  },
} as const;

export const VerificationModal = ({
  processing,
  open,
  step,
}: VerificationModalProps) => (
  <SubmitModal
    disabled={processing}
    open={open}
    icon={<Loader size={48} />}
    title={VERIFICATION_STEPS[step].title}
    submitButton={`Stake on ${networkName}`}
    onSubmit={() => {}}
  >
    {VERIFICATION_STEPS[step].description}
  </SubmitModal>
);
