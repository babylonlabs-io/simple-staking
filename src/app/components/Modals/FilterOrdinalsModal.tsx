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
        <h3 className="font-bold">Ordinals</h3>
        <button
          className="btn btn-circle btn-ghost btn-sm"
          onClick={() => onClose(false)}
        >
          <IoMdClose size={24} />
        </button>
      </div>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 leading-snug text-sm">
          <p className="md:max-w-[34rem]">
            We’ve detected that your wallet contains Bitcoin Ordinals, which are
            unique digital assets. If you proceed without filtering, these
            Ordinals could be included in future actions involving your balance.
          </p>
          <p>Please select:</p>
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
                I would like to <strong>include</strong> Ordinals in my
                stakeable balance
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
                I would like to <strong>exclude</strong> Ordinals in my
                stakeable balance
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
