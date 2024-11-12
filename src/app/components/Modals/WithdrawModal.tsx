import { IoMdClose } from "react-icons/io";

import { Delegation as DelegationInterface } from "@/app/types/delegations";
import { getNetworkConfig } from "@/config/network.config";

import { LoadingView } from "../Loading/Loading";

import { GeneralModal } from "./GeneralModal";

export const MODE_TRANSFORM = "transform";
export const MODE_WITHDRAW = "withdraw";
export type MODE = typeof MODE_TRANSFORM | typeof MODE_WITHDRAW;

interface PreviewModalProps {
  open: boolean;
  onClose: (value: boolean) => void;
  onProceed: () => void;
  mode: MODE;
  awaitingWalletResponse: boolean;
  delegation: DelegationInterface;
}

const { coinName, networkName } = getNetworkConfig();

export const WithdrawModal: React.FC<PreviewModalProps> = ({
  open,
  onClose,
  onProceed,
  awaitingWalletResponse,
}) => {
  const withdrawTitle = "Withdraw";
  const withdrawContent = (
    <>
      You are about to withdraw your stake. <br />A transaction fee will be
      deduced from your stake by the {networkName} network
    </>
  );

  const title = withdrawTitle;
  const content = withdrawContent;

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
