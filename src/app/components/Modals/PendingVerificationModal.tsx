import { Button, Heading, Loader } from "@babylonlabs-io/bbn-core-ui";
import { useCallback } from "react";
import { BiSolidBadgeCheck } from "react-icons/bi";

import { useDelegationV2 } from "@/app/hooks/api/useDelegationV2";
import { useTransactionService } from "@/app/hooks/services/useTransactionService";
import { DelegationV2StakingState as state } from "@/app/types/delegationsV2";
import { getNetworkConfig } from "@/config/network.config";

import { GeneralModal } from "./GeneralModal";

interface PendingVerificationModalProps {
  open: boolean;
  onClose: () => void;
  awaitingWalletResponse: boolean;
  stakingTxHash: string;
}

const Verified = () => (
  <>
    <BiSolidBadgeCheck className="text-5xl" />
    <Heading variant="h4">Verified</Heading>
    <p className="text-base text-center">
      Your request has been verified by the babylon blockchain. You can now
      stake
    </p>
  </>
);

const NotVerified = () => (
  <>
    <Loader size={48} />
    <Heading variant="h4">Pending Verification</Heading>
    <p className="text-base text-center">
      The babylon blockchain has received your request. Please wait while we
      confirm the neseccary amount of signatures
    </p>
  </>
);

export function PendingVerificationModal({
  open,
  onClose,
  awaitingWalletResponse,
  stakingTxHash,
}: PendingVerificationModalProps) {
  const { submitStakingTx } = useTransactionService();
  const { networkName } = getNetworkConfig();

  const { data: delegation = null } = useDelegationV2(stakingTxHash);

  const onStake = useCallback(async () => {
    if (!delegation) {
      throw new Error("Delegation not found");
    }
    const {
      finalityProviderBtcPksHex,
      stakingAmount,
      stakingTime,
      paramsVersion,
      stakingTxHashHex,
      stakingTxHex,
    } = delegation;

    await submitStakingTx(
      {
        finalityProviderPkNoCoordHex: finalityProviderBtcPksHex[0],
        stakingAmountSat: stakingAmount,
        stakingTimeBlocks: stakingTime,
      },
      paramsVersion,
      stakingTxHashHex,
      stakingTxHex,
    );
    onClose();
  }, [delegation, submitStakingTx, onClose]);

  const verified = delegation?.state === state.VERIFIED;

  return (
    <GeneralModal
      open={open}
      onClose={onClose}
      closeOnOverlayClick={false}
      closeOnEsc={false}
    >
      <div className="flex flex-col gap-8 md:max-w-[34rem] text-primary-dark">
        <div className="py-4 flex flex-col items-center gap-4">
          {verified ? <Verified /> : <NotVerified />}
        </div>
        <Button
          disabled={!verified || awaitingWalletResponse}
          onClick={onStake}
        >
          {awaitingWalletResponse ? (
            <Loader size={24} />
          ) : (
            <span>Stake on {networkName}</span>
          )}
        </Button>
      </div>
    </GeneralModal>
  );
}
