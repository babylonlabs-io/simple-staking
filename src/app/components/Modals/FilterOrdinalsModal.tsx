import { IoMdClose } from "react-icons/io";

import { GeneralModal } from "./GeneralModal";

interface FilterOrdinalsModalProps {
  open: boolean;
  onClose: (value: boolean) => void;
  shouldFilterOrdinals: boolean;
  setShouldFilterOrdinals: (value: boolean) => void;
}

export const FilterOrdinalsModal: React.FC<FilterOrdinalsModalProps> = ({
  open,
  onClose,
  shouldFilterOrdinals,
  setShouldFilterOrdinals,
}) => {
  return (
    <GeneralModal open={open} onClose={onClose}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-bold">Bitcoin inscriptions</h3>
        <button
          className="btn btn-circle btn-ghost btn-sm"
          onClick={() => onClose(false)}
        >
          <IoMdClose size={24} />
        </button>
      </div>
      <div className="flex flex-col gap-4 md:max-w-[34rem]">
        <div className="flex flex-col gap-4 leading-snug text-sm">
          <p>
            This staking interface attempts to detect bitcoin ordinals, NFTs,
            Runes, and other inscriptions (“Inscriptions”) within the Unspent
            Transaction Outputs (“UTXOs”) in your wallet. If you stake bitcoin
            with Inscriptions, those UTXOs may be spent on staking, unbonding,
            or withdrawal fees, which will cause you to lose those Inscriptions
            permanently. This interface will not detect all Inscriptions.
          </p>
          <p>Choose one:</p>
        </div>
        <div className="flex flex-col gap-4 rounded-xl bg-base-100 p-3 md:p-4">
          <div className="form-control">
            <label className="label cursor-pointer justify-start gap-2">
              <input
                type="radio"
                name="ordinals-radio"
                className="radio checked:bg-primary"
                checked={!shouldFilterOrdinals}
                onChange={() => setShouldFilterOrdinals(false)}
              />
              <span className="label-text">
                <strong>Use</strong> bitcoin UTXOs with detected Inscriptions in
                my stakable balance.
                <br />I understand and agree that doing so can cause the
                complete and permanent loss of Inscriptions and that I am solely
                liable and responsible for their loss.
              </span>
            </label>
          </div>
          <div className="form-control">
            <label className="label cursor-pointer justify-start gap-2">
              <input
                type="radio"
                name="ordinals-radio"
                className="radio checked:bg-primary"
                checked={shouldFilterOrdinals}
                onChange={() => setShouldFilterOrdinals(true)}
              />
              <span className="label-text">
                <strong>Don&apos;t use</strong> bitcoin UTXOs with detected
                Inscriptions so they will not be spent.
              </span>
            </label>
          </div>
        </div>
        <p className="text-xs opacity-50">
          * You can change this setting later if needed
        </p>
        <button
          className="btn-primary btn flex-1"
          onClick={() => onClose(false)}
        >
          Confirm
        </button>
      </div>
    </GeneralModal>
  );
};
