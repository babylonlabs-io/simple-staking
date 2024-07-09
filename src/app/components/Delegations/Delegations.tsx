import { networks } from "bitcoinjs-lib";
import { useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { useLocalStorage } from "usehooks-ts";

import { SignPsbtTransaction } from "@/app/common/utils/psbt";
import { LoadingTableList } from "@/app/components/Loading/Loading";
import { useError } from "@/app/context/Error/ErrorContext";
import { QueryMeta } from "@/app/types/api";
import {
  Delegation as DelegationInterface,
  DelegationState,
} from "@/app/types/delegations";
import { ErrorState } from "@/app/types/errors";
import { GlobalParamsVersion } from "@/app/types/globalParams";
import { signUnbondingTx } from "@/utils/delegations/signUnbondingTx";
import { signWithdrawalTx } from "@/utils/delegations/signWithdrawalTx";
import { getIntermediateDelegationsLocalStorageKey } from "@/utils/local_storage/getIntermediateDelegationsLocalStorageKey";
import { toLocalStorageIntermediateDelegation } from "@/utils/local_storage/toLocalStorageIntermediateDelegation";
import { WalletProvider } from "@/utils/wallet/wallet_provider";

import {
  MODE,
  MODE_UNBOND,
  MODE_WITHDRAW,
  UnbondWithdrawModal,
} from "../Modals/UnbondWithdrawModal";

import { Delegation } from "./Delegation";

interface DelegationsProps {
  finalityProvidersKV: Record<string, string>;
  delegationsAPI: DelegationInterface[];
  delegationsLocalStorage: DelegationInterface[];
  globalParamsVersion: GlobalParamsVersion;
  publicKeyNoCoord: string;
  btcWalletNetwork: networks.Network;
  address: string;
  signPsbtTx: SignPsbtTransaction;
  pushTx: WalletProvider["pushTx"];
  queryMeta: QueryMeta;
  getNetworkFees: WalletProvider["getNetworkFees"];
}

export const Delegations: React.FC<DelegationsProps> = ({
  finalityProvidersKV,
  delegationsAPI,
  delegationsLocalStorage,
  globalParamsVersion,
  publicKeyNoCoord,
  btcWalletNetwork,
  address,
  signPsbtTx,
  pushTx,
  queryMeta,
  getNetworkFees,
}) => {
  const [stakingFeeRate, setStakingFeeRate] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [txID, setTxID] = useState("");
  const [modalMode, setModalMode] = useState<MODE>();
  const { showError } = useError();

  // Local storage state for intermediate delegations (withdrawing, unbonding)
  const intermediateDelegationsLocalStorageKey =
    getIntermediateDelegationsLocalStorageKey(publicKeyNoCoord);

  const [
    intermediateDelegationsLocalStorage,
    setIntermediateDelegationsLocalStorage,
  ] = useLocalStorage<DelegationInterface[]>(
    intermediateDelegationsLocalStorageKey,
    [],
  );

  // Update the local storage with the new intermediate delegation state
  const updateLocalStorage = (
    delegation: DelegationInterface,
    newState: string,
  ) => {
    setIntermediateDelegationsLocalStorage((delegations) => [
      toLocalStorageIntermediateDelegation(
        delegation.stakingTxHashHex,
        publicKeyNoCoord,
        delegation.finalityProviderPkHex,
        delegation.stakingValueSat,
        delegation.stakingTx.txHex,
        delegation.stakingTx.timelock,
        newState,
      ),
      ...delegations,
    ]);
  };

  // Handles unbonding requests for Active delegations that want to be withdrawn early
  // It constructs an unbonding transaction, creates a signature for it, and submits both to the back-end API
  const handleUnbond = async (id: string) => {
    try {
      // Sign the unbonding transaction
      const { delegation } = await signUnbondingTx(
        id,
        delegationsAPI,
        publicKeyNoCoord,
        btcWalletNetwork,
        signPsbtTx,
      );
      // Update the local state with the new intermediate delegation
      updateLocalStorage(delegation, DelegationState.INTERMEDIATE_UNBONDING);
    } catch (error: Error | any) {
      showError({
        error: {
          message: error.message,
          errorState: ErrorState.UNBONDING,
          errorTime: new Date(),
        },
        retryAction: () => handleModal(id, MODE_UNBOND),
      });
    } finally {
      setModalOpen(false);
      setTxID("");
      setModalMode(undefined);
    }
  };

  // Handles withdrawing requests for delegations that have expired timelocks
  // It constructs a withdrawal transaction, creates a signature for it, and submits it to the Bitcoin network
  const handleWithdraw = async (id: string) => {
    try {
      // Sign the withdrawal transaction
      const { delegation } = await signWithdrawalTx(
        id,
        delegationsAPI,
        publicKeyNoCoord,
        btcWalletNetwork,
        signPsbtTx,
        address,
        getNetworkFees,
        pushTx,
      );
      // Update the local state with the new intermediate delegation
      updateLocalStorage(delegation, DelegationState.INTERMEDIATE_WITHDRAWAL);
    } catch (error: Error | any) {
      showError({
        error: {
          message: error.message,
          errorState: ErrorState.WITHDRAW,
          errorTime: new Date(),
        },
        retryAction: () => handleModal(id, MODE_WITHDRAW),
      });
    } finally {
      setModalOpen(false);
      setTxID("");
      setModalMode(undefined);
    }
  };

  const handleModal = (txID: string, mode: MODE) => {
    setModalOpen(true);
    setTxID(txID);
    setModalMode(mode);
  };

  const handleStakingFeeRateChange = (feeRate: number) => {
    setStakingFeeRate(feeRate);
  };

  useEffect(() => {
    if (!delegationsAPI) {
      return;
    }

    setIntermediateDelegationsLocalStorage((intermediateDelegations) => {
      if (!intermediateDelegations) {
        return [];
      }

      return intermediateDelegations.filter((intermediateDelegation) => {
        const matchingDelegation = delegationsAPI.find(
          (delegation) =>
            delegation?.stakingTxHashHex ===
            intermediateDelegation?.stakingTxHashHex,
        );

        if (!matchingDelegation) {
          return true; // keep intermediate state if no matching state is found in the API
        }

        // conditions based on intermediate states
        if (
          intermediateDelegation.state ===
          DelegationState.INTERMEDIATE_UNBONDING
        ) {
          return !(
            matchingDelegation.state === DelegationState.UNBONDING_REQUESTED ||
            matchingDelegation.state === DelegationState.UNBONDING ||
            matchingDelegation.state === DelegationState.UNBONDED
          );
        }

        if (
          intermediateDelegation.state ===
          DelegationState.INTERMEDIATE_WITHDRAWAL
        ) {
          return matchingDelegation.state !== DelegationState.WITHDRAWN;
        }

        return true;
      });
    });
  }, [delegationsAPI, setIntermediateDelegationsLocalStorage]);

  // combine delegations from the API and local storage, prioritizing API data
  const combinedDelegationsData = delegationsAPI
    ? [...delegationsLocalStorage, ...delegationsAPI]
    : // if no API data, fallback to using only local storage delegations
      delegationsLocalStorage;

  return (
    <div className=" flex flex-col lg:flex-1 ">
      <div className="border border-es-border py-7 px-6">
        <h3 className="font-bold text-xl text-es-text uppercase">
          TRANSACTION HISTORY
        </h3>
      </div>
      {combinedDelegationsData.length === 0 ? (
        <div className="rounded-2xl border border-neutral-content p-4 text-center">
          <p>No history found</p>
        </div>
      ) : (
        <>
          <div className="hidden grid-cols-5 gap-2 px-6 lg:grid border border-es-border border-t-0">
            <p className="p-5 uppercase text-center text-sm font-medium text-es-text-secondary border-r border-r-es-border">
              DATE
            </p>
            <p className="p-5 uppercase text-center text-sm font-medium text-es-text-secondary border-r border-r-es-border">
              Amount
            </p>
            <p className="p-5 uppercase text-center text-sm font-medium text-es-text-secondary border-r border-r-es-border">
              Transaction hash
            </p>
            <p className="p-5 uppercase text-center text-sm font-medium text-es-text-secondary ">
              Status
            </p>
            <p className="p-5 uppercase text-center text-sm font-medium text-es-text-secondary border-l border-l-es-border">
              Action
            </p>
          </div>
          <div
            id="staking-history"
            className="no-scrollbar max-h-[21rem] overflow-y-auto"
          >
            <InfiniteScroll
              className="flex flex-col"
              dataLength={combinedDelegationsData.length}
              next={queryMeta.next}
              hasMore={queryMeta.hasMore}
              loader={queryMeta.isFetchingMore ? <LoadingTableList /> : null}
              scrollableTarget="staking-history"
            >
              {combinedDelegationsData?.map((delegation) => {
                if (!delegation) return null;
                const {
                  stakingValueSat,
                  stakingTx,
                  stakingTxHashHex,
                  finalityProviderPkHex,
                  state,
                  isOverflow,
                } = delegation;
                // Get the moniker of the finality provider
                const finalityProviderMoniker =
                  finalityProvidersKV[finalityProviderPkHex];
                const intermediateDelegation =
                  intermediateDelegationsLocalStorage.find(
                    (item) => item.stakingTxHashHex === stakingTxHashHex,
                  );

                return (
                  <Delegation
                    key={stakingTxHashHex + stakingTx.startHeight}
                    finalityProviderMoniker={finalityProviderMoniker}
                    stakingTx={stakingTx}
                    stakingValueSat={stakingValueSat}
                    stakingTxHash={stakingTxHashHex}
                    state={state}
                    onUnbond={() => handleModal(stakingTxHashHex, MODE_UNBOND)}
                    onWithdraw={() =>
                      handleModal(stakingTxHashHex, MODE_WITHDRAW)
                    }
                    intermediateState={intermediateDelegation?.state}
                    isOverflow={isOverflow}
                    globalParamsVersion={globalParamsVersion}
                  />
                );
              })}
            </InfiniteScroll>
          </div>
        </>
      )}

      {modalMode && txID && (
        <UnbondWithdrawModal
          unbondingTimeBlocks={globalParamsVersion.unbondingTime}
          unbondingFeeSat={globalParamsVersion.unbondingFeeSat}
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onProceed={() => {
            modalMode === MODE_UNBOND
              ? handleUnbond(txID)
              : handleWithdraw(txID);
          }}
          mode={modalMode}
        />
      )}
    </div>
  );
};
