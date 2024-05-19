import { useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";

import { FinalityProvider as FinalityProviderInterface } from "@/app/api/getFinalityProviders";
import { FinalityProvider } from "./FinalityProvider";
import { PreviewModal } from "../Modals/PreviewModal";
import { blocksToTime } from "@/utils/blocksToTime";
import { ConnectLarge } from "../Connect/ConnectLarge";

interface StakingParams {
  minStakingAmount: number;
  maxStakingAmount: number;
  minStakingTime: number;
  maxStakingTime: number;
  stakingCap: number;
}

interface StakingProps {
  amount: number;
  onAmountChange: (amount: number) => void;
  term: number;
  onTermChange: (term: number) => void;
  finalityProviders: FinalityProviderInterface[] | undefined;
  selectedFinalityProvider: FinalityProviderInterface | undefined;
  // called when the user selects a finality provider
  onFinalityProviderChange: (btcPkHex: string) => void;
  onSign: () => void;
  stakingParams: StakingParams | undefined;
  isWalletConnected: boolean;
  overTheCap: boolean;
  isLoading: boolean;
  isUpgrading: boolean | undefined;
  // if the staking cap is reached, the user can't stake
  onConnect: () => void;
  finalityProvidersFetchNext: () => void;
  finalityProvidersHasNext: boolean;
  finalityProvidersIsLoading: boolean;
  finalityProvidersIsFetchingMore: boolean;
}

export const Staking: React.FC<StakingProps> = ({
  amount,
  onAmountChange,
  term,
  onTermChange,
  finalityProviders,
  selectedFinalityProvider,
  onFinalityProviderChange,
  onSign,
  stakingParams,
  isWalletConnected,
  overTheCap,
  onConnect,
  finalityProvidersFetchNext,
  finalityProvidersHasNext,
  finalityProvidersIsLoading,
  finalityProvidersIsFetchingMore,
  isLoading,
  isUpgrading,
}) => {
  const [previewModalOpen, setPreviewModalOpen] = useState(false);

  const renderFixedTerm = (params: StakingParams) => {
    const { minStakingTime, maxStakingTime } = params;
    if (minStakingTime && maxStakingTime && minStakingTime === maxStakingTime) {
      return (
        <div className="card mb-2 bg-base-200 p-4">
          <p>
            Your Signet BTC will be staked for a fixed term of{" "}
            {blocksToTime(minStakingTime)}.
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
            min={minStakingTime}
            max={maxStakingTime}
            value={term}
            onChange={(e) => onTermChange(Number(e.target.value))}
          />
          <div className="label flex justify-end">
            <span className="label-text-alt">
              min term is {minStakingTime} blocks
            </span>
          </div>
        </label>
      );
    }
  };

  const renderContentForm = () => {
    // 1. wallet is not connected
    if (!isWalletConnected) {
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
    // 2. wallet is connected but we are still loading the staking params
    else if (isLoading) {
      return (
        <div className="flex justify-center py-4">
          <span className="loading loading-spinner text-primary" />
        </div>
      );
    }
    // 3. wallet is connected but staking has not started
    else if (!stakingParams) {
      return (
        <div className="flex flex-col gap-1">
          <p className="text-sm dark:text-neutral-content">
            Staking has not started
          </p>
          <p>Staking app is not yet activated</p>
          <p>
            Please check back later or follow our social media channels for
            updates.
          </p>
        </div>
      );
    }
    // 4. Global params are transitioning into a new version
    else if (isUpgrading) {
      return (
        <div className="flex flex-col gap-1">
          <p className="text-sm dark:text-neutral-content">
            Staking upgrade in progress
          </p>
          <p>The staking parameters are getting upgraded.</p>
          <p>
            Please check back later or follow our social media channels for
            updates.
          </p>
        </div>
      );
    }
    // 4. wallet is connected but staking cap is reached
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
    } else {
      const {
        minStakingTime,
        maxStakingTime,
        minStakingAmount,
        maxStakingAmount,
      } = stakingParams;
      const stakingTimeReady =
        minStakingTime === maxStakingTime ||
        (term >= minStakingTime && term <= maxStakingTime);

      const minAmountBTC = minStakingAmount ? minStakingAmount / 1e8 : 0;
      const maxAmountBTC = maxStakingAmount ? maxStakingAmount / 1e8 : 0;

      const amountReady =
        minAmountBTC &&
        maxAmountBTC &&
        amount >= minAmountBTC &&
        amount <= maxAmountBTC;

      const signReady =
        amountReady && stakingTimeReady && selectedFinalityProvider;
      return (
        <>
          <div className="flex flex-col gap-1">
            <p className="text-sm dark:text-neutral-content">Step 2</p>
            <p>Set up staking terms</p>
          </div>
          <div className="flex flex-1 flex-col">
            <div className="flex flex-1 flex-col">
              {renderFixedTerm(stakingParams)}
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
          <div
            id="finality-providers"
            className="no-scrollbar max-h-[21rem] overflow-y-auto"
          >
            <InfiniteScroll
              className="flex flex-col gap-4"
              dataLength={finalityProviders?.length || 0}
              next={finalityProvidersFetchNext}
              hasMore={finalityProvidersHasNext}
              loader={
                finalityProvidersIsFetchingMore ? (
                  <div className="w-full text-center">
                    <span className="loading loading-spinner text-primary" />
                  </div>
                ) : null
              }
              scrollableTarget="finality-providers"
            >
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
            </InfiniteScroll>
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
