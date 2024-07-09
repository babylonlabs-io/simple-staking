import { useState } from "react";
import { IoMdClose } from "react-icons/io";

import { getNetworkConfig } from "@/config/network.config";
import { blocksToDisplayTime } from "@/utils/blocksToDisplayTime";
import { satoshiToBtc } from "@/utils/btcConversions";
import { maxDecimals } from "@/utils/maxDecimals";

import { GeneralModal } from "./GeneralModal";

export const MODE_UNBOND = "unbond";
export const MODE_WITHDRAW = "withdraw";
export type MODE = typeof MODE_UNBOND | typeof MODE_WITHDRAW;

interface PreviewModalProps {
  unbondingTimeBlocks: number;
  unbondingFeeSat: number;
  open: boolean;
  onClose: (value: boolean) => void;
  onProceed: () => void;
  mode: MODE;
}

export const UnbondWithdrawModal: React.FC<PreviewModalProps> = ({
  unbondingTimeBlocks,
  unbondingFeeSat,
  open,
  onClose,
  onProceed,
  mode,
}) => {
  const { coinName, networkName } = getNetworkConfig();

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

  const unbondButtonText = "UNBOND";
  const withdrawButtonText = "Withdraw";

  const [selectedFeeRate, setSelectedFeeRate] = useState(0);
  const [resetFormInputs, setResetFormInputs] = useState(false);

  const handleSelectedFeeRate = (fee: number) => {
    setSelectedFeeRate(fee);
  };

  return (
    <GeneralModal
      open={open}
      onClose={onClose}
      small
      classNames={{ modal: "stake-modal unbond-modal" }}
    >
      <div className="md:max-w-[480px]">
        <div className="flex flex-col flex-grow mt-8 md:max-w-[480px]">
          <h3 className="text-center font-semibold text-xl uppercase">
            {mode === MODE_UNBOND ? unbondTitle : withdrawTitle}
          </h3>
          <div className="absolute right-4 top-4">
            <button
              className="btn btn-circle btn-ghost btn-sm"
              onClick={() => onClose(false)}
            >
              <IoMdClose size={24} />
            </button>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <p className="px-9 pt-4 text-es-accent font-medium">{content}</p>

          <div className="flex gap-4">
            <button
              className="es-button"
              onClick={() => {
                onClose(false);
                onProceed();
              }}
            >
              {mode === MODE_UNBOND ? unbondButtonText : withdrawButtonText}
            </button>
          </div>
        </div>
      </div>
    </GeneralModal>
  );
};
