import { AiOutlineSignature } from "react-icons/ai";
import { IoMdCheckmark, IoMdClose } from "react-icons/io";

import { GeneralModal } from "./GeneralModal";

type Status = "unsigned" | "signed" | "processing";

interface EOIModalProps {
  statuses: {
    slashing: Status;
    unbonding: Status;
    reward: Status;
    eoi: Status;
  };
  open: boolean;
  onClose: (value: boolean) => void;
}

const STATUS_ICON = {
  unsigned: <AiOutlineSignature size={20} />,
  signed: <IoMdCheckmark className="text-success" size={20} />,
  processing: (
    <span className="loading loading-spinner loading-xs text-primary" />
  ),
} as const;

export function EOIModal({ open, statuses, onClose }: EOIModalProps) {
  return (
    <GeneralModal open={open} onClose={onClose}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-bold">Staking Express Of Interest</h3>
        <button
          className="btn btn-circle btn-ghost btn-sm"
          onClick={() => onClose(false)}
        >
          <IoMdClose size={24} />
        </button>
      </div>

      <div className="py-4">
        <p>
          Please sign the messages below to prepare your staking
          express-of-interest (EOI):
        </p>

        <ul className="my-8 md:pl-6 text-primary">
          <li className="flex gap-1 mb-4 items-center">
            {STATUS_ICON[statuses.slashing]}
            Consent to slashing
          </li>
          <li className="flex gap-1 mb-4 items-center">
            {STATUS_ICON[statuses.unbonding]}
            Consent to slashing during unbonding
          </li>
          <li className="flex gap-1 mb-4 items-center">
            {STATUS_ICON[statuses.reward]}
            BTC-BBN address binding for receiving staking rewards
          </li>
          <li className="flex gap-1 mb-4 items-center">
            {STATUS_ICON[statuses.eoi]}
            EOI transaction
          </li>
        </ul>

        <p>
          Please come back in a minute to check your EOI status. Once it is
          accepted, you can proceed to submit the staking transaction to BTC.
        </p>
      </div>
    </GeneralModal>
  );
}
