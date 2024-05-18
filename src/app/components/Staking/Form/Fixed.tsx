import { useState } from "react";

import { FinalityProvider as FinalityProviderInterface } from "@/app/api/getFinalityProviders";
import { blocksToTime } from "@/utils/blocksToTime";
import { PreviewModal } from "@/app/components/Modals/PreviewModal";

interface FixedProps {
  onSign: (amountSat: number, termBlocks: number) => Promise<void>;
  selectedFinalityProvider: FinalityProviderInterface | undefined;
  minStakingAmount: number;
  maxStakingAmount: number;
  stakingTime: number;
}

// Fixed term + amount with fp check
export const Fixed: React.FC<FixedProps> = ({
  onSign,
  selectedFinalityProvider,
  minStakingAmount,
  maxStakingAmount,
  stakingTime,
}) => {
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [amountBTC, setAmountBTC] = useState(minStakingAmount / 1e8);

  // TODO extract BTC <- -> sBTC conversion to a helper function
  const minAmountBTC = minStakingAmount ? minStakingAmount / 1e8 : 0;
  const maxAmountBTC = maxStakingAmount ? maxStakingAmount / 1e8 : 0;

  const amountReady =
    minAmountBTC &&
    maxAmountBTC &&
    amountBTC >= minAmountBTC &&
    amountBTC <= maxAmountBTC;

  const signReady = amountReady && selectedFinalityProvider;

  // reset the component state
  const handleSign = () => {
    setAmountBTC(0);
    setPreviewModalOpen(false);
    onSign(amountSat, stakingTime);
  };

  // Rounding the input since 0.0006 * 1e8 is is 59999.999
  const amountSat = Math.round(amountBTC * 1e8);

  return (
    <>
      <p>Set up staking terms</p>
      <div className="flex flex-1 flex-col">
        <div className="flex flex-1 flex-col">
          <div className="card mb-2 bg-base-200 p-4">
            <p>
              Your Signet BTC will be staked for a fixed term of{" "}
              {blocksToTime(stakingTime)}.
            </p>
            <p>
              But you can unbond and withdraw your Signet BTC anytime through
              this dashboard with an unbond time of 10 days.
            </p>
            <p>
              The above times are approximates based on average Bitcoin block
              times.
            </p>
          </div>
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
          termBlocks={stakingTime}
        />
      </div>
    </>
  );
};
