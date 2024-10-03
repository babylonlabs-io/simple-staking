import type { networks } from "bitcoinjs-lib";
import { useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { useLocalStorage } from "usehooks-ts";

import {
  signPsbtTransaction,
  SignPsbtTransaction,
} from "@/app/common/utils/psbt";
import { LoadingTableList } from "@/app/components/Loading/Loading";
import { DelegationsPointsProvider } from "@/app/context/api/DelegationsPointsProvider";
import { useError } from "@/app/context/Error/ErrorContext";
import { useWallet } from "@/app/context/wallet/WalletProvider";
import { useDelegations } from "@/app/hooks/useDelegations";
import { useHealthCheck } from "@/app/hooks/useHealthCheck";
import { useAppState } from "@/app/state";
import { useDelegationState } from "@/app/state/DelegationState";
import {
  Delegation as DelegationInterface,
  DelegationState,
} from "@/app/types/delegations";
import { ErrorState } from "@/app/types/errors";
import { GlobalParamsVersion } from "@/app/types/globalParams";
import { shouldDisplayPoints } from "@/config";
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

export const Delegations = () => {
  const { currentVersion } = useAppState();
  const { data: delegationsAPI } = useDelegations();
  const {
    walletProvider: btcWallet,
    address,
    publicKeyNoCoord,
    connected,
    network,
  } = useWallet();

  if (!btcWallet || !delegationsAPI || !currentVersion || !network) {
    return;
  }

  return (
    network && (
      <DelegationsPointsProvider
        publicKeyNoCoord={publicKeyNoCoord}
        delegationsAPI={delegationsAPI.delegations}
        isWalletConnected={connected}
        address={address}
      >
        <DelegationsContent
          delegationsAPI={delegationsAPI.delegations}
          globalParamsVersion={currentVersion}
          signPsbtTx={signPsbtTransaction(btcWallet)}
          pushTx={btcWallet.pushTx}
          getNetworkFees={btcWallet.getNetworkFees}
          address={address}
          btcWalletNetwork={network}
          publicKeyNoCoord={publicKeyNoCoord}
          isWalletConnected={connected}
        />
      </DelegationsPointsProvider>
    )
  );
};

interface DelegationsContentProps {
  delegationsAPI: DelegationInterface[];
  globalParamsVersion: GlobalParamsVersion;
  publicKeyNoCoord: string;
  btcWalletNetwork: networks.Network;
  address: string;
  signPsbtTx: SignPsbtTransaction;
  pushTx: WalletProvider["pushTx"];
  getNetworkFees: WalletProvider["getNetworkFees"];
  isWalletConnected: boolean;
}

const DelegationsContent: React.FC<DelegationsContentProps> = ({
  delegationsAPI,
  globalParamsVersion,
  signPsbtTx,
  pushTx,
  getNetworkFees,
  address,
  btcWalletNetwork,
  publicKeyNoCoord,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [txID, setTxID] = useState("");
  const [modalMode, setModalMode] = useState<MODE>();
  const { showError } = useError();
  const { isApiNormal, isGeoBlocked } = useHealthCheck();
  const [awaitingWalletResponse, setAwaitingWalletResponse] = useState(false);
  const [selectedDelegationHeight, setSelectedDelegationHeight] = useState<
    number | undefined
  >();
  const {
    delegations = [],
    fetchMoreDelegations,
    hasMoreDelegations,
    isLoading,
  } = useDelegationState();

  const shouldShowPoints =
    isApiNormal && !isGeoBlocked && shouldDisplayPoints();
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
    const newTxId = delegation.stakingTxHashHex;

    setIntermediateDelegationsLocalStorage((delegations) => {
      // Check if an intermediate delegation with the same transaction ID already exists
      const exists = delegations.some(
        (existingDelegation) => existingDelegation.stakingTxHashHex === newTxId,
      );

      // If it doesn't exist, add the new intermediate delegation
      if (!exists) {
        return [
          toLocalStorageIntermediateDelegation(
            newTxId,
            publicKeyNoCoord,
            delegation.finalityProviderPkHex,
            delegation.stakingValueSat,
            delegation.stakingTx.txHex,
            delegation.stakingTx.timelock,
            newState,
          ),
          ...delegations,
        ];
      }

      // If it exists, return the existing delegations unchanged
      return delegations;
    });
  };

  // Handles unbonding requests for Active delegations that want to be withdrawn early
  // It constructs an unbonding transaction, creates a signature for it, and submits both to the back-end API
  const handleUnbond = async (id: string) => {
    try {
      // Prevent the modal from closing
      setAwaitingWalletResponse(true);
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
        },
        retryAction: () =>
          handleModal(id, MODE_UNBOND, selectedDelegationHeight!),
      });
    } finally {
      setModalOpen(false);
      setTxID("");
      setModalMode(undefined);
      setAwaitingWalletResponse(false);
      setSelectedDelegationHeight(undefined);
    }
  };

  // Handles withdrawing requests for delegations that have expired timelocks
  // It constructs a withdrawal transaction, creates a signature for it, and submits it to the Bitcoin network
  const handleWithdraw = async (id: string) => {
    try {
      // Prevent the modal from closing
      setAwaitingWalletResponse(true);
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
        },
        retryAction: () =>
          handleModal(id, MODE_WITHDRAW, selectedDelegationHeight!),
      });
    } finally {
      setModalOpen(false);
      setTxID("");
      setModalMode(undefined);
      setAwaitingWalletResponse(false);
      setSelectedDelegationHeight(undefined);
    }
  };

  const handleModal = (txID: string, mode: MODE, delegationHeight: number) => {
    setModalOpen(true);
    setTxID(txID);
    setModalMode(mode);
    setSelectedDelegationHeight(delegationHeight);
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
    ? [...delegations, ...delegationsAPI]
    : // if no API data, fallback to using only local storage delegations
      delegations;

  return (
    <div className="card flex flex-col gap-2 bg-base-300 p-4 shadow-sm lg:flex-1">
      <h3 className="mb-4 font-bold">Staking history</h3>
      {combinedDelegationsData.length === 0 ? (
        <div className="rounded-2xl border border-neutral-content p-4 text-center dark:border-neutral-content/20">
          <p>No history found</p>
        </div>
      ) : (
        <>
          <div
            className={`hidden ${shouldShowPoints ? "grid-cols-6" : "grid-cols-5"} gap-2 px-4 lg:grid`}
          >
            <p>Amount</p>
            <p>Inception</p>
            <p className="text-center">Transaction hash</p>
            <p className="text-center">Status</p>
            {shouldShowPoints && <p className="text-center">Points</p>}
            <p>Action</p>
          </div>
          <div
            id="staking-history"
            className="no-scrollbar max-h-[21rem] overflow-y-auto"
          >
            <InfiniteScroll
              className="flex flex-col gap-4 pt-3"
              dataLength={combinedDelegationsData.length}
              next={fetchMoreDelegations}
              hasMore={hasMoreDelegations}
              loader={isLoading ? <LoadingTableList /> : null}
              scrollableTarget="staking-history"
            >
              {combinedDelegationsData?.map((delegation) => {
                if (!delegation) return null;
                const {
                  stakingValueSat,
                  stakingTx,
                  stakingTxHashHex,
                  state,
                  isOverflow,
                } = delegation;
                const intermediateDelegation =
                  intermediateDelegationsLocalStorage.find(
                    (item) => item.stakingTxHashHex === stakingTxHashHex,
                  );

                return (
                  <Delegation
                    key={stakingTxHashHex + stakingTx.startHeight}
                    stakingTx={stakingTx}
                    stakingValueSat={stakingValueSat}
                    stakingTxHash={stakingTxHashHex}
                    state={state}
                    onUnbond={() =>
                      handleModal(
                        stakingTxHashHex,
                        MODE_UNBOND,
                        stakingTx.startHeight,
                      )
                    }
                    onWithdraw={() =>
                      handleModal(
                        stakingTxHashHex,
                        MODE_WITHDRAW,
                        stakingTx.startHeight,
                      )
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
      {modalMode && txID && selectedDelegationHeight !== undefined && (
        <UnbondWithdrawModal
          delegationHeight={selectedDelegationHeight}
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onProceed={() => {
            modalMode === MODE_UNBOND
              ? handleUnbond(txID)
              : handleWithdraw(txID);
          }}
          mode={modalMode}
          awaitingWalletResponse={awaitingWalletResponse}
        />
      )}
    </div>
  );
};
