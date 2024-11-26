import { AiOutlineSignature } from "react-icons/ai";
import { IoMdCheckmark } from "react-icons/io";

import { GeneralModal } from "./GeneralModal";

export enum EOIStepStatus {
  UNSIGNED = "UNSIGNED",
  SIGNED = "SIGNED",
  PROCESSING = "PROCESSING",
}

interface EOIModalProps {
  statuses: {
    slashing: EOIStepStatus;
    unbonding: EOIStepStatus;
    reward: EOIStepStatus;
    eoi: EOIStepStatus;
  };
  open: boolean;
  onClose: () => void;
}

const STATUS_ICON = {
  [EOIStepStatus.UNSIGNED]: <AiOutlineSignature size={20} />,
  [EOIStepStatus.SIGNED]: <IoMdCheckmark className="text-success" size={20} />,
  [EOIStepStatus.PROCESSING]: (
    <span className="loading loading-spinner loading-xs text-primary" />
  ),
} as const;

export function EOIModal({ open, statuses, onClose }: EOIModalProps) {
  return (
    <GeneralModal
      open={open}
      onClose={onClose}
      closeOnOverlayClick={false}
      closeOnEsc={false}
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-bold">Staking</h3>
      </div>

      <div className="py-4">
        <p>Please sign the following messages</p>

        <ul className="my-8 md:pl-6">
          <li className="flex gap-1 mb-4 items-center">
            {STATUS_ICON[statuses.slashing]}
            Step 1: Consent to slashing
          </li>
          <li className="flex gap-1 mb-4 items-center">
            {STATUS_ICON[statuses.unbonding]}
            Step 2: Consent to slashing during unbonding
          </li>
          <li className="flex gap-1 mb-4 items-center">
            {STATUS_ICON[statuses.reward]}
            Step 3: BTC-BBN address binding for receiving staking rewards
          </li>
          <li className="flex gap-1 mb-4 items-center">
            {STATUS_ICON[statuses.eoi]}
            Step 4: Staking transaction registration
          </li>
        </ul>
      </div>
    </GeneralModal>
  );
}
