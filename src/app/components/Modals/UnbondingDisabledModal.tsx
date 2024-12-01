import { useState } from "react";
import { IoMdClose } from "react-icons/io";
import { useLocalStorage } from "usehooks-ts";

import { shouldDisableUnbonding } from "@/config";
import { getNetworkConfig } from "@/config/network.config";

import { GeneralModal } from "./GeneralModal";

const Title: React.FC = () => {
  return (
    <h3 className="font-bold">Unbonding disabled during Phase-2 Transition</h3>
  );
};

const Content: React.FC = () => {
  const { network, coinName } = getNetworkConfig();

  return (
    <div className="text-text-black dark:text-white">
      <div className="mt-6 flex flex-col gap-4">
        <p>
          In preparation for the upcoming Phase-2 {network} launch, on-demand
          stake unbonding is disabled.
          <br />
          Once the Phase-2 {network} is launched, you will be able to transit
          your
          {coinName} stake to Phase-2 and then unbond.
        </p>
      </div>
    </div>
  );
};

export const UnbondingDisabledModal: React.FC = () => {
  const [unbondingDisabledModalOpened, setUnbondingDisabledModalOpened] =
    useLocalStorage<boolean>("bbn-unbonding-disabled-modal-opened", false);

  const [unbondingDisabledModalOpen, setUnbondingDisabledModalOpen] = useState(
    !unbondingDisabledModalOpened && shouldDisableUnbonding(),
  );

  const onClose = () => {
    setUnbondingDisabledModalOpen(false);
    setUnbondingDisabledModalOpened(true);
  };

  return (
    <GeneralModal open={unbondingDisabledModalOpen} onClose={onClose}>
      <div className="mb-4 flex items-center justify-between">
        <Title />
        <button className="btn btn-circle btn-ghost btn-sm" onClick={onClose}>
          <IoMdClose size={24} />
        </button>
      </div>
      <Content />
    </GeneralModal>
  );
};
