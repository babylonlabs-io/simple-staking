import { FaCheckCircle } from "react-icons/fa";

import { useDelegationV2 } from "@/app/hooks/api/useDelegationV2";
import { DelegationV2StakingState as state } from "@/app/types/delegationsV2";
import { getNetworkConfig } from "@/config/network.config";

import { GeneralModal } from "./GeneralModal";

interface PendingVerificationModalProps {
  open: boolean;
  onClose: (value: boolean) => void;
  onStake?: () => void;
  awaitingWalletResponse: boolean;
  stakingTxHash: string;
}

const Verified = () => (
  <>
    <FaCheckCircle className="text-5xl text-success" />
    <h3 className="text-xl text-center">Verified</h3>
    <p className="text-sm text-center">
      Your request has been verified by the babylon blockchain. You can now
      stake
    </p>
  </>
);

const NotVerified = () => (
  <>
    <span className="loading loading-spinner loading-lg text-primary" />
    <h3 className="text-xl text-center">Pending Verification</h3>
    <p className="text-sm text-center">
      The babylon blockchain has received your request. Please wait while we
      confirm the neseccary amount of signatures
    </p>
  </>
);

export function PendingVerificationModal({
  open,
  onClose,
  onStake,
  awaitingWalletResponse,
  stakingTxHash,
}: PendingVerificationModalProps) {
  const { networkName } = getNetworkConfig();

  const { data: delegation = null } = useDelegationV2(stakingTxHash);

  const verified = delegation?.state === state.VERIFIED;

  return (
    <GeneralModal
      open={open}
      onClose={onClose}
      closeOnOverlayClick={false}
      closeOnEsc={false}
    >
      <div className="flex flex-col gap-8 md:max-w-[34rem]">
        <div className="py-4 flex flex-col items-center gap-4">
          {verified ? <Verified /> : <NotVerified />}
        </div>
        <button
          className="btn btn-primary"
          disabled={!verified || awaitingWalletResponse}
          onClick={onStake}
        >
          {awaitingWalletResponse ? (
            <span className="loading loading-spinner"></span>
          ) : (
            <span>Stake on {networkName}</span>
          )}
        </button>
      </div>
    </GeneralModal>
  );
}
