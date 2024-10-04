import { IoMdClose } from "react-icons/io";

import { useGlobalParams } from "@/app/context/api/GlobalParamsProvider";
import { Delegation as DelegationInterface } from "@/app/types/delegations";
import { getNetworkConfig } from "@/config/network.config";
import { blocksToDisplayTime } from "@/utils/blocksToDisplayTime";
import { satoshiToBtc } from "@/utils/btcConversions";
import { getCurrentGlobalParamsVersion } from "@/utils/globalParams";
import { maxDecimals } from "@/utils/maxDecimals";

import { LoadingView } from "../Loading/Loading";

import { GeneralModal } from "./GeneralModal";

export const MODE_UNBOND = "unbond";
export const MODE_WITHDRAW = "withdraw";
export type MODE = typeof MODE_UNBOND | typeof MODE_WITHDRAW;

interface PreviewModalProps {
  open: boolean;
  onClose: (value: boolean) => void;
  onProceed: () => void;
  mode: MODE;
  awaitingWalletResponse: boolean;
  delegationsAPI: DelegationInterface[];
  txID: string;
}

export const UnbondWithdrawModal: React.FC<PreviewModalProps> = ({
  open,
  onClose,
  onProceed,
  mode,
  awaitingWalletResponse,
  delegationsAPI,
  txID,
}) => {
  const { coinName, networkName } = getNetworkConfig();
  const { data: allGlobalParamsVersions } = useGlobalParams();

  const getGlobalParamsForDelegation = (startHeight: number) => {
    const { currentVersion } = getCurrentGlobalParamsVersion(
      startHeight,
      allGlobalParamsVersions || [],
    );
    return currentVersion;
  };

  const delegation = delegationsAPI.find(
    (delegation) => delegation.stakingTxHashHex === txID,
  );
  if (!delegation) {
    throw new Error("Delegation not found");
  }

  const globalParams = getGlobalParamsForDelegation(
    delegation.stakingTx.startHeight,
  );
  const unbondingFeeSat = globalParams?.unbondingFeeSat || 0;
  const unbondingTimeBlocks = globalParams?.unbondingTime || 0;

  const unbondTitle = "Unbond";

  const unbondContent = (
    <>
      You are about to unbond your stake before its expiration. <br />A
      transaction fee of{" "}
      <strong>
        {maxDecimals(satoshiToBtc(unbondingFeeSat), 8) || 0} {coinName}
      </strong>{" "}
      will be deduced from your stake by the {networkName} network. <br />
      The expected unbonding time will be about{" "}
      <strong>{blocksToDisplayTime(unbondingTimeBlocks)}</strong>. <br />
      After unbonded, you will need to use this dashboard to withdraw your stake
      for it to appear in your wallet.
    </>
  );

  const withdrawTitle = "Withdraw";
  const withdrawContent = (
    <>
      You are about to withdraw your stake. <br />A transaction fee will be
      deduced from your stake by the {networkName} network
    </>
  );

  const title = mode === MODE_UNBOND ? unbondTitle : withdrawTitle;
  const content = mode === MODE_UNBOND ? unbondContent : withdrawContent;

  return (
    <GeneralModal
      open={open}
      onClose={onClose}
      closeOnEsc={false}
      closeOnOverlayClick={!awaitingWalletResponse}
      small
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-bold">{title}</h3>
        {!awaitingWalletResponse && (
          <button
            className="btn btn-circle btn-ghost btn-sm"
            onClick={() => onClose(false)}
          >
            <IoMdClose size={24} />
          </button>
        )}
      </div>
      <div className="flex flex-col gap-4">
        <p className="text-left dark:text-neutral-content">{content}</p>
        {awaitingWalletResponse ? (
          <LoadingView
            text="Awaiting wallet signature and broadcast"
            noBorder
          />
        ) : (
          <div className="flex gap-4">
            <button
              className="btn btn-outline flex-1"
              onClick={() => {
                onClose(false);
              }}
            >
              Cancel
            </button>
            <button className="btn-primary btn flex-1" onClick={onProceed}>
              Proceed
            </button>
          </div>
        )}
      </div>
    </GeneralModal>
  );
};
