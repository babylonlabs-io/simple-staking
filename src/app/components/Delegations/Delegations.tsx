import { useEffect } from "react";
import { useLocalStorage } from "usehooks-ts";
import { Transaction, networks } from "bitcoinjs-lib";
import {
  unbondingTransaction,
  withdrawEarlyUnbondedTransaction,
  withdrawTimelockUnbondedTransaction,
} from "btc-staking-ts";

import { Delegation as DelegationInterface } from "@/app/api/getDelegations";
import { Delegation } from "./Delegation";
import { WalletProvider } from "@/utils/wallet/wallet_provider";
import { GlobalParamsVersion } from "@/app/api/getGlobalParams";
import { getUnbondingEligibility } from "@/app/api/getUnbondingEligibility";
import { apiDataToStakingScripts } from "@/utils/apiDataToStakingScripts";
import { postUnbonding } from "@/app/api/postUnbonding";
import { toLocalStorageIntermediateDelegation } from "@/utils/local_storage/toLocalStorageIntermediateDelegation";
import { getIntermediateDelegationsLocalStorageKey } from "@/utils/local_storage/getIntermediateDelegationsLocalStorageKey";
import { DelegationState } from "@/app/types/delegationState";
import { getCurrentGlobalParamsVersion } from "@/utils/getCurrentGlobalParamsVersion";

interface DelegationsProps {
  finalityProvidersKV: Record<string, string>;
  delegationsAPI: DelegationInterface[];
  delegationsLocalStorage: DelegationInterface[];
  globalParamsVersion: GlobalParamsVersion;
  publicKeyNoCoord: string;
  unbondingFee: number;
  withdrawalFee: number;
  btcWalletNetwork: networks.Network;
  address: string;
  signPsbt: WalletProvider["signPsbt"];
  pushTx: WalletProvider["pushTx"];
  getBTCTipHeight: () => Promise<number>;
}

export const Delegations: React.FC<DelegationsProps> = ({
  finalityProvidersKV,
  delegationsAPI,
  delegationsLocalStorage,
  globalParamsVersion,
  publicKeyNoCoord,
  unbondingFee,
  withdrawalFee,
  btcWalletNetwork,
  address,
  signPsbt,
  pushTx,
  getBTCTipHeight,
}) => {
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
      (delegation) => delegation.staking_tx_hash_hex === id,
    );
    if (!delegation) {
      throw new Error("Delegation not found");
    }

    // Check if the unbonding is possible
    const unbondingEligibility = await getUnbondingEligibility(
      delegation.staking_tx_hash_hex,
    );
    if (!unbondingEligibility) {
      throw new Error("Not eligible for unbonding");
    }

    // State of global params when the staking transaction was submitted
    const globalParamsWhenStaking = await getCurrentGlobalParamsVersion(
      delegation.staking_tx.start_height,
    );

    // Recreate the staking scripts
    const data = apiDataToStakingScripts(
      delegation.finality_provider_pk_hex,
      delegation.staking_tx.timelock,
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
      Transaction.fromHex(delegation.staking_tx.tx_hex),
      unbondingFee,
      btcWalletNetwork,
      delegation.staking_tx.output_index,
    );

    // Sign the unbonding transaction
    const unbondingTx = Transaction.fromHex(
      await signPsbt(unsignedUnbondingTx.toHex()),
    );

    // Get the staker signature
    const stakerSignature = unbondingTx.ins[0].witness[0].toString("hex");

    // POST unbonding to the API
    const _response = postUnbonding({
      staker_signed_signature_hex: stakerSignature,
      staking_tx_hash_hex: delegation.staking_tx_hash_hex,
      unbonding_tx_hash_hex: Transaction.fromHex(unbondingTx.toHex()).getId(),
      unbonding_tx_hex: unbondingTx.toHex(),
    });

    // Update the local state with the new delegation
    setIntermediateDelegationsLocalStorage((delegations) => [
      toLocalStorageIntermediateDelegation(
        delegation.staking_tx_hash_hex,
        publicKeyNoCoord,
        delegation.finality_provider_pk_hex,
        delegation.staking_value,
        delegation.staking_tx.tx_hex,
        delegation.staking_tx.timelock,
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
      (delegation) => delegation.staking_tx_hash_hex === id,
    );
    if (!delegation) {
      throw new Error("Delegation not found");
    }

    // State of global params when the staking transaction was submitted
    const globalParamsWhenStaking = await getCurrentGlobalParamsVersion(
      delegation.staking_tx.start_height,
    );

    // Recreate the staking scripts
    const data = apiDataToStakingScripts(
      delegation.finality_provider_pk_hex,
      delegation.staking_tx.timelock,
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
    if (delegation?.unbonding_tx) {
      // Withdraw funds from an unbonding transaction that was submitted for early unbonding and the unbonding period has passed
      unsignedWithdrawalTx = withdrawEarlyUnbondedTransaction(
        unbondingTimelockScript,
        slashingScript,
        Transaction.fromHex(delegation.unbonding_tx.tx_hex),
        address,
        withdrawalFee,
        btcWalletNetwork,
        delegation.staking_tx.output_index,
      );
    } else {
      // Withdraw funds from a staking transaction in which the timelock naturally expired
      unsignedWithdrawalTx = withdrawTimelockUnbondedTransaction(
        timelockScript,
        slashingScript,
        unbondingScript,
        Transaction.fromHex(delegation.staking_tx.tx_hex),
        address,
        withdrawalFee,
        btcWalletNetwork,
        delegation.staking_tx.output_index,
      );
    }

    // Sign the withdrawal transaction
    const withdrawalTransaction = Transaction.fromHex(
      await signPsbt(unsignedWithdrawalTx.toHex()),
    );

    // Broadcast withdrawal transaction
    const _txID = await pushTx(withdrawalTransaction.toHex());

    // Update the local state with the new delegation
    setIntermediateDelegationsLocalStorage((delegations) => [
      toLocalStorageIntermediateDelegation(
        delegation.staking_tx_hash_hex,
        publicKeyNoCoord,
        delegation.finality_provider_pk_hex,
        delegation.staking_value,
        delegation.staking_tx.tx_hex,
        delegation.staking_tx.timelock,
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
    }
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
              delegation?.staking_tx_hash_hex ===
                intermediateDelegation?.staking_tx_hash_hex &&
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
      <div className="hidden grid-cols-5 gap-2 px-4 lg:grid">
        <p>Amount</p>
        <p>Inception</p>
        <p>Transaction hash</p>
        <p>Status</p>
        <p>Action</p>
      </div>
      <div className="no-scrollbar flex max-h-[21rem] flex-col gap-4 overflow-y-auto">
        {combinedDelegationsData?.map((delegation) => {
          if (!delegation) return null;

          const {
            staking_value,
            staking_tx,
            staking_tx_hash_hex,
            finality_provider_pk_hex,
            state,
          } = delegation;
          // Get the moniker of the finality provider
          const finalityProviderMoniker =
            finalityProvidersKV[finality_provider_pk_hex];
          const intermediateDelegation =
            intermediateDelegationsLocalStorage.find(
              (item) => item.staking_tx_hash_hex === staking_tx_hash_hex,
            );

          return (
            <Delegation
              key={staking_tx_hash_hex + staking_tx.start_height}
              finalityProviderMoniker={finalityProviderMoniker}
              stakingTx={staking_tx}
              stakingValue={staking_value}
              stakingTxHash={staking_tx_hash_hex}
              state={state}
              onUnbond={handleUnbondWithErrors}
              onWithdraw={handleWithdrawWithErrors}
              intermediateState={intermediateDelegation?.state}
            />
          );
        })}
      </div>
    </div>
  );
};
