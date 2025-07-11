import { Loader } from "@babylonlabs-io/core-ui";

import { getNetworkConfig } from "@/ui/common/config/network";

import { SubmitModal } from "./SubmitModal";

interface VerificationModalProps {
  processing: boolean;
  open: boolean;
  step: 1 | 2;
}

const { btc, bbn } = getNetworkConfig();

const VERIFICATION_STEPS = {
  1: {
    title: (
      <>
        1/2 <br /> Processing Confirmation
      </>
    ),
    description: `Waiting for the staking registration to be confirmed on ${bbn.networkFullName}.`,
  },
  2: {
    title: (
      <>
        2/2 <br /> Pending Verification
      </>
    ),
    description: `The ${bbn.networkFullName} is verifying your staking transaction.`,
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
    icon={<Loader size={48} className="text-primary-light" />}
    title={VERIFICATION_STEPS[step].title}
    submitButton={`Stake ${btc.coinName}`}
    cancelButton=""
  >
    {VERIFICATION_STEPS[step].description}
  </SubmitModal>
);
