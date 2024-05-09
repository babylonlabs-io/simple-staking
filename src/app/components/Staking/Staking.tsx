import { Fragment, useState } from "react";

import { FinalityProvider as FinalityProviderInterface } from "@/app/api/getFinalityProviders";
import { FinalityProvider } from "./FinalityProvider";
import { PreviewModal } from "../Modals/PreviewModal";
import { blocksToTime } from "@/utils/blocksToTime";

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
  minAmount: number;
  maxAmount: number;
  minTerm: number;
  maxTerm: number;
  // if the staking cap is reached, the user can't stake
  overTheCap: boolean;
  unbondingTime: number;
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
  unbondingTime,
}) => {
  const [previewModalOpen, setPreviewModalOpen] = useState(false);

  const termsReady =
    minTerm === maxTerm || (term >= minTerm && term <= maxTerm);

  const signReady =
    amount >= minAmount &&
    amount <= maxAmount &&
    termsReady &&
    selectedFinalityProvider;

  const renderFixedTerm = () => {
    if (minTerm === maxTerm) {
      return (
        <div className="card mb-2 bg-base-200 p-4">
          <p>
            Your Signet BTC will be staked for a fixed term of{" "}
            {blocksToTime(minTerm)}.
          </p>
          <p>
            But you can unbond and withdraw your Signet BTC anytime through this
            dashboard with an unbond time of {blocksToTime(unbondingTime)}.
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

  const renderWithOverTheCap = () => {
    if (overTheCap) {
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
    } else {
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
                  min={minAmount}
                  max={maxAmount}
                  step={0.00001}
                  value={amount}
                  onChange={(e) => onAmountChange(Number(e.target.value))}
                  disabled={disabled}
                />
                <div className="label flex justify-end">
                  <span className="label-text-alt">
                    min stake is {minAmount} Signet BTC
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

  return (
    <div className="card flex flex-col gap-2 bg-base-300 p-4 shadow-sm lg:flex-1">
      <h3 className="mb-4 font-bold">Staking</h3>
      <div className="flex flex-col gap-4 lg:flex-row">
        <div className="flex flex-1 flex-col gap-4 lg:basis-3/5 xl:basis-2/3">
          <div className="flex flex-col gap-1">
            <p className="text-sm dark:text-neutral-content">Step 1</p>
            <p>
              Select a BTC Finality Provider or{" "}
              <a
                href="https://docs.babylonchain.io/docs/user-guides/btc-staking-testnet/finality-providers/overview"
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
        </div>
        <div className="flex flex-1 flex-col gap-4 lg:basis-2/5 xl:basis-1/3">
          {renderWithOverTheCap()}
        </div>
      </div>
    </div>
  );
};
