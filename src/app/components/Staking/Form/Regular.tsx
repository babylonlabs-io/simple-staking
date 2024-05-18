import { useState } from "react";

import { FinalityProvider as FinalityProviderInterface } from "@/app/api/getFinalityProviders";
import { PreviewModal } from "@/app/components/Modals/PreviewModal";

interface RegularProps {
  onSign: (amountSat: number, termBlocks: number) => Promise<void>;
  selectedFinalityProvider: FinalityProviderInterface | undefined;
  minStakingAmount: number;
  maxStakingAmount: number;
  minStakingTime: number;
  maxStakingTime: number;
}

// Regular term + amount form with fp check
export const Regular: React.FC<RegularProps> = ({
  onSign,
  selectedFinalityProvider,
  minStakingAmount,
  maxStakingAmount,
  minStakingTime,
  maxStakingTime,
}) => {
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [amountBTC, setAmountBTC] = useState(minStakingAmount / 1e8);
  const [termBlocks, setTermBlocks] = useState(minStakingTime);

  // TODO extract BTC <- -> sBTC conversion to a helper function
  const minAmountBTC = minStakingAmount ? minStakingAmount / 1e8 : 0;
  const maxAmountBTC = maxStakingAmount ? maxStakingAmount / 1e8 : 0;

  const amountReady =
    minAmountBTC &&
    maxAmountBTC &&
    amountBTC >= minAmountBTC &&
    amountBTC <= maxAmountBTC;

  const stakingTimeReady =
    termBlocks >= minStakingTime && termBlocks <= maxStakingTime;

  const signReady = amountReady && stakingTimeReady && selectedFinalityProvider;

  // reset the component state
  const handleSign = () => {
    setAmountBTC(0);
    setTermBlocks(0);
    setPreviewModalOpen(false);
    onSign(amountSat, termBlocks);
  };

  // Rounding the input since 0.0006 * 1e8 is is 59999.999
  const amountSat = Math.round(amountBTC * 1e8);

  return (
    <>
      <p>Set up staking terms</p>
      <div className="flex flex-1 flex-col">
        <div className="flex flex-1 flex-col">
          <label className="form-control w-full flex-1">
            <div className="label">
              <span className="label-text-alt text-base">Term</span>
            </div>
            <input
              type="number"
              placeholder="Blocks"
              className="no-focus input input-bordered w-full"
              min={minStakingTime}
              max={maxStakingTime}
              value={termBlocks}
              onChange={(e) => setTermBlocks(Number(e.target.value))}
            />
            <div className="label flex justify-end">
              <span className="label-text-alt">
                min term is {minStakingTime} blocks
              </span>
            </div>
          </label>
          <label className="form-control w-full flex-1">
            <div className="label pt-0">
              <span className="label-text-alt text-base">Amount</span>
            </div>
            <input
              type="number"
              placeholder="BTC"
              className="no-focus input input-bordered w-full"
              min={minAmountBTC}
              max={maxAmountBTC}
              step={0.00001}
              value={amountBTC}
              onChange={(e) => setAmountBTC(Number(e.target.value))}
            />
            <div className="label flex justify-end">
              <span className="label-text-alt">
                min stake is {minAmountBTC} Signet BTC
              </span>
            </div>
          </label>
        </div>
        <button
          className="btn-primary btn mt-2 w-full"
          disabled={!signReady}
          onClick={() => setPreviewModalOpen(true)}
        >
          Preview
        </button>
        <PreviewModal
          open={previewModalOpen}
          onClose={setPreviewModalOpen}
          onSign={handleSign}
          finalityProvider={selectedFinalityProvider?.description.moniker}
          amountSat={amountSat}
          termBlocks={termBlocks}
        />
      </div>
    </>
  );
};
