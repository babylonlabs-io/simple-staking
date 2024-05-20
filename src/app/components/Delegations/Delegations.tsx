import { useEffect, useState } from "react";
import { useLocalStorage } from "usehooks-ts";
import { Psbt, Transaction, networks } from "bitcoinjs-lib";
import {
  unbondingTransaction,
  withdrawEarlyUnbondedTransaction,
  withdrawTimelockUnbondedTransaction,
} from "btc-staking-ts";
import InfiniteScroll from "react-infinite-scroll-component";

import {
  Delegation as DelegationInterface,
  DelegationState,
} from "@/app/types/delegations";
import { Delegation } from "./Delegation";
import { WalletProvider } from "@/utils/wallet/wallet_provider";
import { getGlobalParams } from "@/app/api/getGlobalParams";
import { GlobalParamsVersion } from "@/app/types/globalParams";
import { getUnbondingEligibility } from "@/app/api/getUnbondingEligibility";
import { apiDataToStakingScripts } from "@/utils/apiDataToStakingScripts";
import { postUnbonding } from "@/app/api/postUnbonding";
import { toLocalStorageIntermediateDelegation } from "@/utils/local_storage/toLocalStorageIntermediateDelegation";
import { getIntermediateDelegationsLocalStorageKey } from "@/utils/local_storage/getIntermediateDelegationsLocalStorageKey";
import { getCurrentGlobalParamsVersion } from "@/utils/globalParams";
import {
  UnbondWithdrawModal,
  MODE,
  MODE_UNBOND,
  MODE_WITHDRAW,
} from "../Modals/UnbondWithdrawModal";
import { LoadingTableList, LoadingView } from "../Loading/Loading";
import { QueryMeta } from "@/app/types/api";

interface DelegationsProps {
  finalityProvidersKV: Record<string, string>;
  delegationsAPI: DelegationInterface[];
  delegationsLocalStorage: DelegationInterface[];
  globalParamsVersion: GlobalParamsVersion;
  publicKeyNoCoord: string;
  unbondingFeeSat: number;
  withdrawalFeeSat: number;
  btcWalletNetwork: networks.Network;
  address: string;
  signPsbt: WalletProvider["signPsbt"];
  pushTx: WalletProvider["pushTx"];
  queryMeta: QueryMeta;
}

export const Delegations: React.FC<DelegationsProps> = ({
  finalityProvidersKV,
  delegationsAPI,
  delegationsLocalStorage,
  globalParamsVersion,
  publicKeyNoCoord,
  unbondingFeeSat,
  withdrawalFeeSat,
  btcWalletNetwork,
  address,
  signPsbt,
  pushTx,
  queryMeta,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [txID, setTxID] = useState("");
  const [modalMode, setModalMode] = useState<MODE>();

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

  // Handles unbonding requests for Active delegations that want to be withdrawn early
  // It constructs an unbonding transaction, creates a signature for it, and submits both to the back-end API
  const handleUnbond = async (id: string) => {
    // Check if the data is available
    if (!delegationsAPI || !globalParamsVersion) {
      throw new Error("No back-end API data available");
    }

    // Find the delegation in the delegations retrieved from the API
    const delegation = delegationsAPI.find(
      (delegation) => delegation.stakingTxHashHex === id,
    );
    if (!delegation) {
      throw new Error("Delegation not found");
    }

    // Check if the unbonding is possible
    const unbondingEligibility = await getUnbondingEligibility(
      delegation.stakingTxHashHex,
    );
    if (!unbondingEligibility) {
      throw new Error("Not eligible for unbonding");
    }

    const paramVersions = await getGlobalParams();
    // State of global params when the staking transaction was submitted
    const { currentVersion: globalParamsWhenStaking } =
      getCurrentGlobalParamsVersion(
        delegation.stakingTx.startHeight,
        paramVersions,
      );

    // Recreate the staking scripts
    const data = apiDataToStakingScripts(
      delegation.finalityProviderPkHex,
      delegation.stakingTx.timelock,
      globalParamsWhenStaking,
      publicKeyNoCoord,
    );

    // Destructure the staking scripts
    const {
      timelockScript,
      slashingScript,
      unbondingScript,
      unbondingTimelockScript,
    } = data;

    // Create the unbonding transaction
    const unsignedUnbondingTx = unbondingTransaction(
      unbondingScript,
      unbondingTimelockScript,
      timelockScript,
      slashingScript,
      Transaction.fromHex(delegation.stakingTx.txHex),
      unbondingFeeSat,
      btcWalletNetwork,
      delegation.stakingTx.outputIndex,
    );

    // Sign the unbonding transaction
    let unbondingTx: Transaction;
    try {
      const signedPsbt = await signPsbt(unsignedUnbondingTx.toHex());
      unbondingTx = Psbt.fromHex(signedPsbt).extractTransaction();
    } catch (error) {
      throw new Error("Failed to sign PSBT for the unbonding transaction");
    }
    // Get the staker signature
    const stakerSignature = unbondingTx.ins[0].witness[0].toString("hex");

    // POST unbonding to the API
    const _response = postUnbonding(
      stakerSignature,
      delegation.stakingTxHashHex,
      Transaction.fromHex(unbondingTx.toHex()).getId(),
      unbondingTx.toHex(),
    );

    // Update the local state with the new delegation
    setIntermediateDelegationsLocalStorage((delegations) => [
      toLocalStorageIntermediateDelegation(
        delegation.stakingTxHashHex,
        publicKeyNoCoord,
        delegation.finalityProviderPkHex,
        delegation.stakingValueSat,
        delegation.stakingTx.txHex,
        delegation.stakingTx.timelock,
        DelegationState.INTERMEDIATE_UNBONDING,
      ),
      ...delegations,
    ]);
  };

  // Currently we use console.error to log errors when unbonding fails
  // This is a temporary solution until we implement a better error handling with UI popups
  const handleUnbondWithErrors = async (id: string) => {
    try {
      handleUnbond(id);
    } catch (error: Error | any) {
      console.error(error?.message || error);
    } finally {
      setModalOpen(false);
      setTxID("");
      setModalMode(undefined);
    }
  };

  // Handles withdrawing requests for delegations that have expired timelocks
  // It constructs a withdrawal transaction, creates a signature for it, and submits it to the Bitcoin network
  const handleWithdraw = async (id: string) => {
    // Check if the data is available
    if (!delegationsAPI || !globalParamsVersion) {
      throw new Error("No back-end API data available");
    }

    // Find the delegation in the delegations retrieved from the API
    const delegation = delegationsAPI.find(
      (delegation) => delegation.stakingTxHashHex === id,
    );
    if (!delegation) {
      throw new Error("Delegation not found");
    }

    const paramVersions = await getGlobalParams();
    // State of global params when the staking transaction was submitted
    const { currentVersion: globalParamsWhenStaking } =
      getCurrentGlobalParamsVersion(
        delegation.stakingTx.startHeight,
        paramVersions,
      );

    // Recreate the staking scripts
    const data = apiDataToStakingScripts(
      delegation.finalityProviderPkHex,
      delegation.stakingTx.timelock,
      globalParamsWhenStaking,
      publicKeyNoCoord,
    );

    // Destructure the staking scripts
    const {
      timelockScript,
      slashingScript,
      unbondingScript,
      unbondingTimelockScript,
    } = data;

    // Create the withdrawal transaction
    let unsignedWithdrawalTx;
    if (delegation?.unbondingTx) {
      // Withdraw funds from an unbonding transaction that was submitted for early unbonding and the unbonding period has passed
      unsignedWithdrawalTx = withdrawEarlyUnbondedTransaction(
        unbondingTimelockScript,
        slashingScript,
        Transaction.fromHex(delegation.unbondingTx.txHex),
        address,
        withdrawalFeeSat,
        btcWalletNetwork,
        delegation.stakingTx.outputIndex,
      );
    } else {
      // Withdraw funds from a staking transaction in which the timelock naturally expired
      unsignedWithdrawalTx = withdrawTimelockUnbondedTransaction(
        timelockScript,
        slashingScript,
        unbondingScript,
        Transaction.fromHex(delegation.stakingTx.txHex),
        address,
        withdrawalFeeSat,
        btcWalletNetwork,
        delegation.stakingTx.outputIndex,
      );
    }

    // Sign the withdrawal transaction
    let withdrawalTransaction: Transaction;
    try {
      const signedPsbt = await signPsbt(unsignedWithdrawalTx.toHex());
      withdrawalTransaction = Psbt.fromHex(signedPsbt).extractTransaction();
    } catch (error) {
      throw new Error("Failed to sign PSBT for the withdrawal transaction");
    }
    // Broadcast withdrawal transaction
    const _txID = await pushTx(withdrawalTransaction.toHex());

    // Update the local state with the new delegation
    setIntermediateDelegationsLocalStorage((delegations) => [
      toLocalStorageIntermediateDelegation(
        delegation.stakingTxHashHex,
        publicKeyNoCoord,
        delegation.finalityProviderPkHex,
        delegation.stakingValueSat,
        delegation.stakingTx.txHex,
        delegation.stakingTx.timelock,
        DelegationState.INTERMEDIATE_WITHDRAWAL,
      ),
      ...delegations,
    ]);
  };

  // Currently we use console.error to log errors when unbonding fails
  // This is a temporary solution until we implement a better error handling with UI popups
  const handleWithdrawWithErrors = async (id: string) => {
    try {
      handleWithdraw(id);
    } catch (error: Error | any) {
      console.error(error?.message || error);
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

  // Remove the intermediate delegations that are already present in the API
  useEffect(() => {
    if (!delegationsAPI) {
      return;
    }

    // check if delegationsAPI has status of unbonded or withdrawn
    // if it does, remove the intermediate delegation from local storage
    setIntermediateDelegationsLocalStorage((intermediateDelegations) =>
      intermediateDelegations?.filter(
        (intermediateDelegation) =>
          !delegationsAPI?.find(
            (delegation) =>
              delegation?.stakingTxHashHex ===
                intermediateDelegation?.stakingTxHashHex &&
              (delegation?.state === DelegationState.UNBONDING_REQUESTED ||
                delegation?.state === DelegationState.WITHDRAWN),
          ),
      ),
    );
  }, [delegationsAPI, setIntermediateDelegationsLocalStorage]);

  // Combine the delegations from the API and local storage
  const combinedDelegationsData = delegationsAPI
    ? [...delegationsLocalStorage, ...delegationsAPI]
    : delegationsLocalStorage;

  return (
    <div className="card flex flex-col gap-2 bg-base-300 p-4 shadow-sm lg:flex-1">
      <h3 className="mb-4 font-bold">Staking history</h3>
      {combinedDelegationsData.length === 0 ? (
        <LoadingView />
      ) : (
        <>
          <div className="hidden grid-cols-5 gap-2 px-4 lg:grid">
            <p>Amount</p>
            <p>Inception</p>
            <p>Transaction hash</p>
            <p>Status</p>
            <p>Action</p>
          </div>
          <div
            id="staking-history"
            className="no-scrollbar max-h-[21rem] overflow-y-auto"
          >
            <InfiniteScroll
              className="flex flex-col gap-4"
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
                  />
                );
              })}
            </InfiniteScroll>
          </div>
        </>
      )}

      {modalMode && txID && modalOpen && (
        <UnbondWithdrawModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onProceed={() => {
            modalMode === MODE_UNBOND
              ? handleUnbondWithErrors(txID)
              : handleWithdrawWithErrors(txID);
          }}
          mode={modalMode}
        />
      )}
    </div>
  );
};
