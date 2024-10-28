import { useEffect, useState } from "react";
import { IoMdClose } from "react-icons/io";

import { useWalletConnection } from "@/app/context/wallet/WalletConnectionProvider";
import { useAppState } from "@/app/state";

import { GeneralModal } from "./GeneralModal";

interface FilterOrdinalsModalProps {}

export const FilterOrdinalsModal: React.FC<FilterOrdinalsModalProps> = ({}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const handleClose = () => setModalOpen(false);

  const { isConnected } = useWalletConnection();
  const { ordinalsExcluded, includeOrdinals, excludeOrdinals } = useAppState();

  useEffect(() => {
    if (isConnected) {
      setModalOpen(true);
    }
  }, [isConnected]);

  return (
    <GeneralModal open={modalOpen} onClose={handleClose}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-bold">
          Ordinals, Bitcoin NFTs, Runes, Bitcoin inscriptions
        </h3>
        <button
          className="btn btn-circle btn-ghost btn-sm"
          onClick={handleClose}
        >
          <IoMdClose size={24} />
        </button>
      </div>
      <div className="flex flex-col gap-4 md:max-w-[34rem]">
        <div className="flex flex-col gap-4 leading-snug text-sm">
          <p>
            Your wallet may contain Bitcoin Ordinals, which are unique digital
            assets. If you proceed without filtering, these Ordinals could be
            included in future actions involving your balance.
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
                checked={!ordinalsExcluded}
                onChange={includeOrdinals}
              />
              <span className="label-text">
                I want to <strong>include</strong> ordinals, bitcoin NFTs,
                Ruins, and any other bitcoin inscriptions in my stakable bitcoin
                balance. I understand that doing so can cause their complete and
                permanent loss and agree that I am solely liable and responsible
                for their loss. I have been warned.
              </span>
            </label>
          </div>
          <div className="form-control">
            <label className="label cursor-pointer justify-start gap-2">
              <input
                type="radio"
                name="ordinals-radio"
                className="radio checked:bg-primary"
                checked={ordinalsExcluded}
                onChange={excludeOrdinals}
              />
              <span className="label-text">
                I would like to <strong>exclude</strong> ordinals, bitcoin NFTs,
                Ruins, and any other bitcoin inscriptions in my stakable bitcoin
                balance
              </span>
            </label>
          </div>
        </div>
        <p className="text-xs opacity-50">
          * You can change this setting later if needed
        </p>
        <button className="btn-primary btn flex-1" onClick={handleClose}>
          Confirm
        </button>
      </div>
    </GeneralModal>
  );
};
