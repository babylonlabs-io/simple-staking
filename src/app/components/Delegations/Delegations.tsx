import { Card, Heading } from "@babylonlabs-io/bbn-core-ui";
import { HttpStatusCode } from "axios";
import { useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { useLocalStorage } from "usehooks-ts";

import { LoadingTableList } from "@/app/components/Loading/Loading";
import { WithdrawModal } from "@/app/components/Modals/WithdrawModal";
import { API_ENDPOINTS } from "@/app/constants/endpoints";
import { ClientErrorCategory } from "@/app/constants/errorMessages";
import { useError } from "@/app/context/Error/ErrorProvider";
import { ClientError } from "@/app/context/Error/errors/clientError";
import { ServerError } from "@/app/context/Error/errors/serverError";
import { useBTCWallet } from "@/app/context/wallet/BTCWalletProvider";
import { useDelegations } from "@/app/hooks/client/api/useDelegations";
import { useNetworkFees } from "@/app/hooks/client/api/useNetworkFees";
import { useV1TransactionService } from "@/app/hooks/services/useV1TransactionService";
import { useDelegationState } from "@/app/state/DelegationState";
import {
  Delegation as DelegationInterface,
  DelegationState,
} from "@/app/types/delegations";
import { ErrorType } from "@/app/types/errors";
import { getIntermediateDelegationsLocalStorageKey } from "@/utils/local_storage/getIntermediateDelegationsLocalStorageKey";
import { toLocalStorageIntermediateDelegation } from "@/utils/local_storage/toLocalStorageIntermediateDelegation";

import { UnbondModal } from "../Modals/UnbondModal";

import { Delegation } from "./Delegation";

const MODE_TRANSITION = "transition";
const MODE_WITHDRAW = "withdraw";
const MODE_UNBOND = "unbond";
type MODE = typeof MODE_TRANSITION | typeof MODE_WITHDRAW | typeof MODE_UNBOND;

export const Delegations = ({}) => {
  const { publicKeyNoCoord, connected, network } = useBTCWallet();
  const [modalOpen, setModalOpen] = useState(false);
  const [txID, setTxID] = useState("");
  const [modalMode, setModalMode] = useState<MODE>();
  const { handleError } = useError();
  const [awaitingWalletResponse, setAwaitingWalletResponse] = useState(false);
  const { data: delegationsAPI } = useDelegations();
  const {
    delegations = [],
    fetchMoreDelegations,
    hasMoreDelegations,
    isLoading,
  } = useDelegationState();

  const { submitWithdrawalTx, submitUnbondingTx } = useV1TransactionService();
  const { data: networkFees } = useNetworkFees();

  const selectedDelegation = delegationsAPI?.delegations.find(
    (delegation) => delegation.stakingTxHashHex === txID,
  );

  // Local storage state for intermediate delegations (transitioning, withdrawing)
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

  const handleUnbond = async (id: string) => {
    try {
      if (selectedDelegation?.stakingTxHashHex != id) {
        throw new ClientError({
          message: "Wrong delegation selected for unbonding",
          category: ClientErrorCategory.CLIENT_VALIDATION,
          type: ErrorType.UNBONDING,
        });
      }
      // Sign the withdrawal transaction
      const { stakingTx, finalityProviderPkHex, stakingValueSat } =
        selectedDelegation;
      setAwaitingWalletResponse(true);
      await submitUnbondingTx(
        {
          stakingTimelock: stakingTx.timelock,
          finalityProviderPkNoCoordHex: finalityProviderPkHex,
          stakingAmountSat: stakingValueSat,
        },
        stakingTx.startHeight,
        stakingTx.txHex,
      );
      // Update the local state with the new intermediate delegation
      updateLocalStorage(
        selectedDelegation,
        DelegationState.INTERMEDIATE_UNBONDING,
      );
    } catch (error: Error | any) {
      handleError({
        error,
      });
    } finally {
      setModalOpen(false);
      setTxID("");
      setModalMode(undefined);
      setAwaitingWalletResponse(false);
    }
  };

  // Handles withdrawing requests for delegations that have expired timelocks
  // It constructs a withdrawal transaction, creates a signature for it,
  // and submits it to the Bitcoin network
  const handleWithdraw = async (id: string) => {
    try {
      if (!networkFees) {
        // system error
        throw new Error("Network fees not found");
      }
      // Prevent the modal from closing
      setAwaitingWalletResponse(true);

      if (selectedDelegation?.stakingTxHashHex != id) {
        throw new ClientError({
          message: "Wrong delegation selected for withdrawal",
          category: ClientErrorCategory.CLIENT_VALIDATION,
          type: ErrorType.WITHDRAW,
        });
      }
      // Sign the withdrawal transaction
      const { stakingTx, finalityProviderPkHex, stakingValueSat, unbondingTx } =
        selectedDelegation;
      await submitWithdrawalTx(
        {
          stakingTimelock: stakingTx.timelock,
          finalityProviderPkNoCoordHex: finalityProviderPkHex,
          stakingAmountSat: stakingValueSat,
        },
        stakingTx.startHeight,
        stakingTx.txHex,
        unbondingTx?.txHex,
      );
      // Update the local state with the new intermediate delegation
      updateLocalStorage(
        selectedDelegation,
        DelegationState.INTERMEDIATE_WITHDRAWAL,
      );
    } catch (error: Error | any) {
      handleError({
        error,
        displayOptions: {
          retryAction: () => handleModal(id, MODE_WITHDRAW),
        },
      });
    } finally {
      setModalOpen(false);
      setTxID("");
      setModalMode(undefined);
      setAwaitingWalletResponse(false);
    }
  };

  const handleModal = (txID: string, mode: MODE) => {
    setModalOpen(true);
    setTxID(txID);
    setModalMode(mode);
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
        const matchingDelegation = delegationsAPI.delegations.find(
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
          DelegationState.INTERMEDIATE_TRANSITIONING
        ) {
          return !(matchingDelegation.state === DelegationState.TRANSITIONED);
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

  useEffect(() => {
    if (modalOpen && !selectedDelegation) {
      handleError({
        error: new ServerError({
          message: "Delegation not found",
          status: HttpStatusCode.NotFound,
          endpoint: API_ENDPOINTS.STAKER_DELEGATIONS,
        }),
        displayOptions: {
          noCancel: false,
        },
      });
      setModalOpen(false);
      setTxID("");
      setModalMode(undefined);
    }
  }, [modalOpen, selectedDelegation, handleError]);

  if (!connected || !delegationsAPI || !network) {
    return;
  }

  // combine delegations from the API and local storage, prioritizing API data
  const combinedDelegationsData = delegationsAPI
    ? [...delegations, ...delegationsAPI.delegations]
    : // if no API data, fallback to using only local storage delegations
      delegations;

  if (combinedDelegationsData.length === 0) {
    return null;
  }

  return (
    <>
      <Card className="mb-6">
        <Heading variant="h6" className="text-accent-primary py-2 mb-6">
          Pending Registration
        </Heading>

        <InfiniteScroll
          className="no-scrollbar max-h-[25rem] overflow-auto"
          dataLength={combinedDelegationsData.length}
          next={fetchMoreDelegations}
          hasMore={hasMoreDelegations}
          loader={isLoading ? <LoadingTableList /> : null}
        >
          <table className="w-full min-w-[1000px]">
            <thead className="sticky top-0 bg-surface">
              <tr className="text-accent-secondary text-xs">
                <th className="text-left h-[52px] md:min-w-52 px-4 whitespace-nowrap font-normal">
                  Inception
                </th>
                <th className="text-left h-[52px] px-4 whitespace-nowrap font-normal">
                  Finality Provider
                </th>
                <th className="text-left h-[52px] px-4 whitespace-nowrap font-normal">
                  Amount
                </th>
                <th className="text-left h-[52px] px-4 whitespace-nowrap font-normal">
                  Transaction ID
                </th>
                <th className="text-left h-[52px] px-4 whitespace-nowrap font-normal">
                  Status
                </th>
                <th className="text-left h-[52px] px-4 whitespace-nowrap font-normal">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {combinedDelegationsData?.map((delegation) => {
                if (!delegation) return null;
                const { stakingTx, stakingTxHashHex } = delegation;
                const intermediateDelegation =
                  intermediateDelegationsLocalStorage.find(
                    (item) => item.stakingTxHashHex === stakingTxHashHex,
                  );

                return (
                  <Delegation
                    key={stakingTxHashHex + stakingTx.startHeight}
                    delegation={delegation}
                    onWithdraw={() =>
                      handleModal(stakingTxHashHex, MODE_WITHDRAW)
                    }
                    onUnbond={() => handleModal(stakingTxHashHex, MODE_UNBOND)}
                    intermediateState={intermediateDelegation?.state}
                  />
                );
              })}
            </tbody>
          </table>
        </InfiniteScroll>
      </Card>
      {modalMode && txID && selectedDelegation && (
        <WithdrawModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onSubmit={() => {
            handleWithdraw(txID);
          }}
          processing={awaitingWalletResponse}
        />
      )}
      {modalMode === MODE_UNBOND && (
        <UnbondModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onSubmit={() => {
            handleUnbond(txID);
          }}
          processing={awaitingWalletResponse}
        />
      )}
    </>
  );
};
