import { useState } from "react";

import { FinalityProvider as FinalityProviderInterface } from "@/app/api/getFinalityProviders";
import { FinalityProvider } from "./FinalityProvider";
import { PreviewModal } from "../Modals/PreviewModal";
import { blocksToTime } from "@/utils/blocksToTime";
import { ConnectLarge } from "../Connect/ConnectLarge";

interface StakingProps {
  amount: number;
  onAmountChange: (amount: number) => void;
  term: number;
  onTermChange: (term: number) => void;
  disabled: boolean;
  finalityProviders: FinalityProviderInterface[] | undefined;
  selectedFinalityProvider: FinalityProviderInterface | undefined;
  // called when the user selects a finality provider
  onFinalityProviderChange: (btcPkHex: string) => void;
  onSign: () => void;
  minAmount?: number;
  maxAmount?: number;
  minTerm?: number;
  maxTerm?: number;
  // if the staking cap is reached, the user can't stake
  overTheCap?: boolean;
  onConnect: () => void;
}

export const Staking: React.FC<StakingProps> = ({
  amount,
  onAmountChange,
  term,
  onTermChange,
  disabled,
  finalityProviders,
  selectedFinalityProvider,
  onFinalityProviderChange,
  onSign,
  minAmount,
  maxAmount,
  minTerm,
  maxTerm,
  overTheCap,
  onConnect,
}) => {
  const [previewModalOpen, setPreviewModalOpen] = useState(false);

  const termsReady =
    minTerm &&
    maxTerm &&
    (minTerm === maxTerm || (term >= minTerm && term <= maxTerm));

  const minAmountBTC = minAmount ? minAmount / 1e8 : 0;
  const maxAmountBTC = maxAmount ? maxAmount / 1e8 : 0;

  const amountReady =
    minAmountBTC &&
    maxAmountBTC &&
    amount >= minAmountBTC &&
    amount <= maxAmountBTC;

  const signReady = amountReady && termsReady && selectedFinalityProvider;

  const renderFixedTerm = () => {
    if (minTerm && maxTerm && minTerm === maxTerm) {
      return (
        <div className="card mb-2 bg-base-200 p-4">
          <p>
            Your Signet BTC will be staked for a fixed term of{" "}
            {blocksToTime(minTerm)}.
          </p>
          <p>
            But you can unbond and withdraw your Signet BTC anytime through this
            dashboard with an unbond time of 10 days.
          </p>
          <p>
            The above times are approximates based on average Bitcoin block
            times.
          </p>
        </div>
      );
    } else {
      return (
        <label className="form-control w-full flex-1">
          <div className="label">
            <span className="label-text-alt text-base">Term</span>
          </div>
          <input
            type="number"
            placeholder="Blocks"
            className="no-focus input input-bordered w-full"
            min={minTerm}
            max={maxTerm}
            value={term}
            onChange={(e) => onTermChange(Number(e.target.value))}
            disabled={disabled}
          />
          <div className="label flex justify-end">
            <span className="label-text-alt">min term is {minTerm} blocks</span>
          </div>
        </label>
      );
    }
  };

  const renderContentForm = () => {
    // 1. wallet is not connected
    if (disabled) {
      return (
        <div className="flex flex-1 flex-col gap-1">
          <p className="mb-2 text-sm dark:text-neutral-content">
            Please connect wallet to start staking
          </p>
          <div className="flex flex-1 flex-col md:justify-center">
            <ConnectLarge onConnect={onConnect} />
          </div>
        </div>
      );
    }
    // 2. wallet is connected but staking cap is reached
    else if (overTheCap) {
      return (
        <div className="flex flex-col gap-1">
          <p className="text-sm dark:text-neutral-content">
            Staking cap reached
          </p>
          <p>Staking is temporarily disabled due to cap reached.</p>
          <p>
            Please check your staking history to see if any of your stake is
            tagged overflow.
          </p>
          <p>Overflow stake should be unbonded and withdrawn.</p>
        </div>
      );
    }
    // 3. wallet is connected and staking cap is not reached
    else {
      return (
        <>
          <div className="flex flex-col gap-1">
            <p className="text-sm dark:text-neutral-content">Step 2</p>
            <p>Set up staking terms</p>
          </div>
          <div className="flex flex-1 flex-col">
            <div className="flex flex-1 flex-col">
              {renderFixedTerm()}
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
                  value={amount}
                  onChange={(e) => onAmountChange(Number(e.target.value))}
                  disabled={disabled}
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
              disabled={disabled || !signReady}
              onClick={() => setPreviewModalOpen(true)}
            >
              Preview
            </button>
            <PreviewModal
              open={previewModalOpen}
              onClose={setPreviewModalOpen}
              onSign={onSign}
              finalityProvider={selectedFinalityProvider?.description.moniker}
              amount={amount * 1e8}
              term={term}
            />
          </div>
        </>
      );
    }
  };

  const renderFinalityProviders = () => {
    if (finalityProviders && finalityProviders.length > 0) {
      return (
        <>
          <div className="flex flex-col gap-1">
            <p className="text-sm dark:text-neutral-content">Step 1</p>
            <p>
              Select a BTC Finality Provider or{" "}
              <a
                href="https://github.com/babylonchain/networks/tree/main/bbn-test-4/finality-providers"
                target="_blank"
                rel="noopener noreferrer"
                className="sublink text-primary hover:underline"
              >
                create your own
              </a>
              .
            </p>
          </div>
          <div className="hidden gap-2 px-4 lg:grid lg:grid-cols-stakingFinalityProviders">
            <p>Finality Provider</p>
            <p>BTC PK</p>
            <p>Delegation</p>
            <p>Comission</p>
          </div>
          <div className="no-scrollbar flex max-h-[21rem] flex-col gap-4 overflow-y-auto">
            {finalityProviders?.map((fp) => (
              <FinalityProvider
                key={fp.btc_pk}
                moniker={fp.description.moniker}
                pkHex={fp.btc_pk}
                stake={fp.active_tvl}
                comission={fp.commission}
                selected={selectedFinalityProvider?.btc_pk === fp.btc_pk}
                onClick={() => onFinalityProviderChange(fp.btc_pk)}
              />
            ))}
          </div>
        </>
      );
    } else {
      return (
        <div className="flex flex-1 items-center justify-center py-4">
          <span className="loading loading-spinner text-primary" />
        </div>
      );
    }
  };

  return (
    <div className="card flex flex-col gap-2 bg-base-300 p-4 shadow-sm lg:flex-1">
      <h3 className="mb-4 font-bold">Staking</h3>
      <div className="flex flex-col gap-4 lg:flex-row">
        <div className="flex flex-1 flex-col gap-4 lg:basis-3/5 xl:basis-2/3">
          {renderFinalityProviders()}
        </div>
        <div className="flex flex-1 flex-col gap-4 lg:basis-2/5 xl:basis-1/3">
          {renderContentForm()}
        </div>
      </div>
    </div>
  );
};
