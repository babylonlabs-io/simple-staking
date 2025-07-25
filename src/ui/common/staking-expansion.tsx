import { initBTCCurve, UTXO } from "@babylonlabs-io/btc-staking-ts";
import { useWalletConnect } from "@babylonlabs-io/wallet-connector";
import { useEffect, useMemo, useState } from "react";

import { getDelegationV2 } from "@/ui/common/api/getDelegationsV2";
import { UTXOSelector } from "@/ui/common/components/UTXOSelector";
import { ONE_SECOND } from "@/ui/common/constants";
import { useBsn } from "@/ui/common/hooks/client/api/useBsn";
import { useFinalityProvidersV2 } from "@/ui/common/hooks/client/api/useFinalityProvidersV2";
import { useNetworkFees } from "@/ui/common/hooks/client/api/useNetworkFees";
import { useBbnTransaction } from "@/ui/common/hooks/client/rpc/mutation/useBbnTransaction";
import {
  useTransactionService,
  type StakingExpansionInputs,
} from "@/ui/common/hooks/services/useTransactionService";
import { useAutoFundingTransaction } from "@/ui/common/hooks/useFundingTransaction";
import { useHealthCheck } from "@/ui/common/hooks/useHealthCheck";
import { useAppState } from "@/ui/common/state";
import { useDelegationV2State } from "@/ui/common/state/DelegationV2State";
import {
  DelegationV2StakingState as DelegationState,
  type DelegationV2,
} from "@/ui/common/types/delegationsV2";
import {
  FinalityProviderState as FinalityProviderStateEnum,
  type FinalityProvider,
} from "@/ui/common/types/finalityProviders";
import { retry } from "@/ui/common/utils";
import { btcToSatoshi, satoshiToBtc } from "@/ui/common/utils/btc";
import { getFeeRateFromMempool } from "@/ui/common/utils/getFeeRateFromMempool";

import { Container } from "./components/Container/Container";

export type ExpansionType = "amount" | "providers" | "timelock";

const StakingExpansion = () => {
  const [expansionType, setExpansionType] = useState<ExpansionType>("amount");
  const [selectedDelegationHash, setSelectedDelegationHash] =
    useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [timelock, setTimelock] = useState<number>(60480); // Default blocks
  const [selectedProviders, setSelectedProviders] = useState<string[]>([]);
  const [selectedUtxo, setSelectedUtxo] = useState<UTXO | null>(null);
  const [selectedBsnId, setSelectedBsnId] = useState<string>("all");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifiedDelegation, setVerifiedDelegation] =
    useState<DelegationV2 | null>(null);
  const [error, setError] = useState<string>("");
  const [isBtcBroadcasting, setIsBtcBroadcasting] = useState(false);
  const [btcBroadcastSuccess, setBtcBroadcastSuccess] = useState(false);

  useEffect(() => {
    initBTCCurve();
  }, []);

  const { connected } = useWalletConnect();
  const { isGeoBlocked, isLoading } = useHealthCheck();
  const isConnected = connected && !isGeoBlocked && !isLoading;

  // Hooks for data and services
  const { delegations, findDelegationByTxHash, addDelegation, refetch } =
    useDelegationV2State();
  const { data: bsnData } = useBsn();
  const { data: finalityProvidersData } = useFinalityProvidersV2({
    bsnId: selectedBsnId === "all" ? undefined : selectedBsnId,
  });
  const {
    createStakeExpansionTransaction,
    submitExpansionStakingTx,
    submitExpansionStakingTxWithCovenantSignatures,
  } = useTransactionService();
  const { sendBbnTx } = useBbnTransaction();
  const { data: networkFees } = useNetworkFees();
  const { defaultFeeRate, maxFeeRate } = getFeeRateFromMempool(networkFees);
  const { availableUTXOs } = useAppState();
  const {
    fundingTx,
    isLoading: isFundingTxLoading,
    error: fundingTxError,
  } = useAutoFundingTransaction(selectedUtxo);

  // Extract finality providers from the response
  const finalityProviders = finalityProvidersData?.finalityProviders || [];

  // Get the selected delegation
  const selectedDelegation = useMemo(() => {
    if (!selectedDelegationHash) {
      return undefined;
    }

    const found = findDelegationByTxHash(selectedDelegationHash);
    return found;
  }, [selectedDelegationHash, findDelegationByTxHash]);

  // Add validation before the sign button
  const canSignExpansion = useMemo(() => {
    return (
      selectedDelegation &&
      verifiedDelegation &&
      fundingTx &&
      verifiedDelegation.stakingTxHashHex &&
      verifiedDelegation.stakingTxHex
    );
  }, [selectedDelegation, verifiedDelegation, fundingTx]);

  // Handle BTC sign + broadcast
  const handleBtcSignAndBroadcast = async () => {
    if (
      !verifiedDelegation?.stakingTxHashHex ||
      !verifiedDelegation?.stakingTxHex
    ) {
      console.error(
        "❌ [EXPANSION UI DEBUG] Missing verified delegation or tx data",
      );
      setError("No verified delegation found or missing transaction hex");
      return;
    }

    // Add validation for selectedDelegation
    if (!selectedDelegation) {
      console.error("❌ [EXPANSION UI DEBUG] No delegation selected");
      setError("No delegation selected for expansion");
      return;
    }

    // Add validation for fundingTx
    if (!fundingTx) {
      console.error("❌ [EXPANSION UI DEBUG] No funding transaction selected");
      setError("No funding transaction selected");
      return;
    }

    setIsBtcBroadcasting(true);
    setError("");

    try {
      // Use the expansion inputs from the verified delegation (which has the new values)
      const expansionInputs = {
        finalityProviderPksNoCoordHex:
          verifiedDelegation.finalityProviderBtcPksHex,
        stakingAmountSat: verifiedDelegation.stakingAmount,
        stakingTimelock: verifiedDelegation.stakingTimelock,
      };

      // Sign and broadcast the BTC expansion transaction using the new function
      // await submitExpansionStakingTx(
      //   expansionInputs,
      //   verifiedDelegation.paramsVersion,
      //   verifiedDelegation.stakingTxHashHex,
      //   verifiedDelegation.stakingTxHex,
      //   selectedDelegation.stakingTxHashHex, // Previous staking tx hash - now safe
      //   fundingTx, // The funding transaction bytes - now safe
      // );

      // console.log("verifiedDelegation", verifiedDelegation);

      const covenantSignatures =
        verifiedDelegation.covenantUnbondingSignatures?.map((signature) => ({
          btcPkHex: signature.covenantBtcPkHex,
          sigHex: signature.signatureHex,
        })) || [];

      // console.log("covenantSignatures", covenantSignatures);

      await submitExpansionStakingTxWithCovenantSignatures(
        expansionInputs,
        verifiedDelegation.paramsVersion,
        verifiedDelegation.stakingTxHashHex,
        verifiedDelegation.stakingTxHex,
        selectedDelegation.stakingTxHashHex,
        fundingTx,
        covenantSignatures,
      );

      // ✅ NOW reset the form after successful BTC broadcast
      setSelectedDelegationHash("");
      setAmount("");
      setTimelock(60480);
      setSelectedProviders([]);
      setSelectedUtxo(null);
      setVerifiedDelegation(null); // Also reset the verified delegation

      // Refresh UTXOs after successful broadcast
      refetch();
    } catch (error: any) {
      console.error(
        "❌ [EXPANSION UI DEBUG] Error in handleBtcSignAndBroadcast:",
        {
          error: error?.message || String(error),
          stack: error?.stack,
          errorType: typeof error,
          errorName: error?.name,
          fullError: error,
        },
      );
      setError(
        error?.message || "Failed to sign and broadcast BTC transaction",
      );
    } finally {
      setIsBtcBroadcasting(false);
    }
  };

  // Filter active delegations that can be expanded
  const activeDelegations = delegations.filter(
    (d) => d.state === "ACTIVE" && d.stakingTxHashHex,
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!selectedDelegation) {
      setError("Please select a delegation to expand");
      return;
    }

    if (!selectedUtxo) {
      setError("Please select a UTXO to fund the expansion");
      return;
    }

    if (!fundingTx) {
      setError(
        "Funding transaction not available. Please try selecting a different UTXO.",
      );
      return;
    }

    if (fundingTxError) {
      setError(`Error fetching funding transaction: ${fundingTxError}`);
      return;
    }

    setIsSubmitting(true);

    try {
      // Build expansion inputs based on the current delegation and expansion type
      let newAmount = selectedDelegation.stakingAmount;
      let newTimelock = selectedDelegation.stakingTimelock;
      let newProviders = selectedDelegation.finalityProviderBtcPksHex;

      switch (expansionType) {
        case "amount": {
          if (!amount || parseFloat(amount) <= 0) {
            throw new Error("Please enter a valid amount to add");
          }
          newAmount =
            selectedDelegation.stakingAmount + btcToSatoshi(parseFloat(amount));
          break;
        }
        case "timelock": {
          if (timelock <= selectedDelegation.stakingTimelock) {
            throw new Error(
              "New timelock must be greater than current timelock",
            );
          }
          newTimelock = timelock;
          break;
        }
        case "providers": {
          if (selectedProviders.length === 0) {
            throw new Error(
              "Please select at least one finality provider to add",
            );
          }
          // Combine existing and new providers (removing duplicates)
          const allProviders = [
            ...selectedDelegation.finalityProviderBtcPksHex,
            ...selectedProviders,
          ];
          newProviders = [...new Set(allProviders)];
          break;
        }
      }

      const expansionInputs: StakingExpansionInputs = {
        finalityProviderPksNoCoordHex: newProviders,
        stakingAmountSat: newAmount,
        stakingTimelock: newTimelock,
        previousStakingTxHash: selectedDelegation.stakingTxHashHex,
        fundingTx: fundingTx,
      };

      const result = await createStakeExpansionTransaction(
        expansionInputs,
        // defaultFeeRate, // TODO check fee - min relay fee not met, 243 < 245
        defaultFeeRate + 5,
      );

      // Broadcast the signed Babylon transaction
      setIsBroadcasting(true);
      await sendBbnTx(result.signedBabylonTx);
      setIsBroadcasting(false);

      // Get the expansion transaction hash from the BTC staking transaction
      const expansionTxHash = result.stakingTx.getId();

      // Add expansion to local storage with pending verification state
      addDelegation({
        stakingAmount: newAmount,
        stakingTxHashHex: expansionTxHash,
        startHeight: 0,
        state: DelegationState.INTERMEDIATE_PENDING_VERIFICATION,
      });

      // Wait for verification
      setIsVerifying(true);

      const delegation = await retry(
        () => getDelegationV2(expansionTxHash),
        (delegation) => delegation?.state === DelegationState.VERIFIED,
        5 * ONE_SECOND,
      );

      setVerifiedDelegation(delegation as DelegationV2);
      refetch();
      setIsVerifying(false);

      // ✅ DON'T reset form here - keep state for BTC signing
      // The user still needs to sign and broadcast the BTC transaction
    } catch (err) {
      console.error("Error creating expansion transaction:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create expansion transaction",
      );
    } finally {
      setIsSubmitting(false);
      setIsBroadcasting(false);
      setIsVerifying(false);
    }
  };

  if (!isConnected) {
    return (
      <Container
        as="main"
        className="-mt-[10rem] flex flex-col gap-[3rem] pb-16 max-w-[760px] mx-auto flex-1"
      >
        <div className="text-center py-8">
          <h1 className="text-2xl font-bold mb-4">sBTC Staking Expansion</h1>
          <p className="text-gray-600">
            Please connect your wallet to continue
          </p>
        </div>
      </Container>
    );
  }

  return (
    <Container
      as="main"
      className="-mt-[10rem] flex flex-col gap-[3rem] pb-16 max-w-[760px] mx-auto flex-1"
    >
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <h1 className="text-2xl font-bold mb-6">sBTC Staking Expansion</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {/* Delegation Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Existing Delegation
            </label>
            <select
              value={selectedDelegationHash}
              onChange={(e) => setSelectedDelegationHash(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Choose a delegation...</option>
              {activeDelegations.map((delegation) => (
                <option
                  key={delegation.stakingTxHashHex}
                  value={delegation.stakingTxHashHex}
                >
                  {delegation.stakingTxHashHex.slice(0, 8)}...
                  {delegation.stakingTxHashHex.slice(-8)} -{" "}
                  {satoshiToBtc(delegation.stakingAmount)} sBTC
                </option>
              ))}
            </select>
            {activeDelegations.length === 0 && (
              <p className="text-sm text-gray-500 mt-1">
                No active delegations found. You need an active delegation to
                expand.
              </p>
            )}
          </div>

          {selectedDelegation && (
            <div className="p-3 bg-gray-50 rounded-md">
              <h4 className="font-medium text-gray-900 mb-2">
                Current Delegation Details:
              </h4>
              <div className="text-sm text-gray-600 space-y-1">
                <div>
                  Amount: {satoshiToBtc(selectedDelegation.stakingAmount)} sBTC
                </div>
                <div>Timelock: {selectedDelegation.stakingTimelock} blocks</div>
                <div>
                  Finality Providers:{" "}
                  {selectedDelegation.finalityProviderBtcPksHex.length}
                </div>
              </div>
            </div>
          )}

          {/* Expansion Type Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Expansion Type
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="expansionType"
                  value="amount"
                  checked={expansionType === "amount"}
                  onChange={(e) =>
                    setExpansionType(e.target.value as ExpansionType)
                  }
                  className="mr-2"
                />
                Increase Staking Amount
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="expansionType"
                  value="providers"
                  checked={expansionType === "providers"}
                  onChange={(e) =>
                    setExpansionType(e.target.value as ExpansionType)
                  }
                  className="mr-2"
                />
                Add Finality Providers
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="expansionType"
                  value="timelock"
                  checked={expansionType === "timelock"}
                  onChange={(e) =>
                    setExpansionType(e.target.value as ExpansionType)
                  }
                  className="mr-2"
                />
                Extend Timelock
              </label>
            </div>
          </div>

          {/* UTXO Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select UTXO to Fund Expansion
            </label>
            <UTXOSelector
              utxos={availableUTXOs || []}
              selectedUtxo={selectedUtxo}
              onUtxoSelect={setSelectedUtxo}
              requiredAmount={
                expansionType === "amount" && amount
                  ? btcToSatoshi(parseFloat(amount))
                  : undefined
              }
            />
            {fundingTxError && (
              <div className="mt-2 p-2 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
                Error loading funding transaction: {fundingTxError}
              </div>
            )}
            {isFundingTxLoading && (
              <div className="mt-2 p-2 bg-blue-100 border border-blue-400 text-blue-700 rounded text-sm">
                Loading funding transaction...
              </div>
            )}
            {selectedUtxo &&
              expansionType === "amount" &&
              amount &&
              parseFloat(amount) > 0 &&
              selectedUtxo.value < btcToSatoshi(parseFloat(amount)) + 1000 && (
                <div className="mt-2 p-2 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded text-sm">
                  Warning: Selected UTXO may not have sufficient funds for this
                  expansion amount plus transaction fees.
                </div>
              )}
          </div>

          {/* Conditional Form Fields */}
          {expansionType === "amount" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Amount (sBTC)
              </label>
              <input
                type="number"
                step="0.00000001"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.01"
                required
              />
            </div>
          )}

          {expansionType === "providers" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by BSN Network
                </label>
                <select
                  value={selectedBsnId}
                  onChange={(e) => setSelectedBsnId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Networks</option>
                  {bsnData?.map((bsn) => (
                    <option key={bsn.id} value={bsn.id}>
                      {bsn.name} ({bsn.id})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Additional Finality Providers
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-300 rounded-md p-3">
                  {finalityProviders
                    .filter(
                      (fp: FinalityProvider) =>
                        fp.state === FinalityProviderStateEnum.ACTIVE ||
                        fp.state === FinalityProviderStateEnum.INACTIVE,
                    )
                    .map((provider: FinalityProvider) => (
                      <label key={provider.btcPk} className="flex items-center">
                        <input
                          type="checkbox"
                          value={provider.btcPk}
                          checked={selectedProviders.includes(provider.btcPk)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedProviders([
                                ...selectedProviders,
                                provider.btcPk,
                              ]);
                            } else {
                              setSelectedProviders(
                                selectedProviders.filter(
                                  (p) => p !== provider.btcPk,
                                ),
                              );
                            }
                          }}
                          className="mr-2"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <div className="font-medium">
                              {provider.description?.moniker ||
                                "Unknown Provider"}
                            </div>
                            <span
                              className={`text-xs px-2 py-1 rounded ${
                                provider.state ===
                                FinalityProviderStateEnum.ACTIVE
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {provider.state ===
                              FinalityProviderStateEnum.ACTIVE
                                ? "Active"
                                : "Inactive"}
                            </span>
                            {provider.bsnId && (
                              <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800">
                                {provider.bsnId}
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">
                            {provider.btcPk.slice(0, 16)}...
                          </div>
                        </div>
                      </label>
                    ))}
                </div>
                {finalityProviders.filter(
                  (fp: FinalityProvider) =>
                    fp.state === FinalityProviderStateEnum.ACTIVE ||
                    fp.state === FinalityProviderStateEnum.INACTIVE,
                ).length === 0 && (
                  <p className="text-sm text-gray-500 mt-1">
                    No finality providers available in the selected BSN network.
                  </p>
                )}
              </div>
            </div>
          )}

          {expansionType === "timelock" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Timelock (blocks)
              </label>
              <input
                type="number"
                min="1"
                value={timelock}
                onChange={(e) => setTimelock(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                Current: 60,480 blocks (~6 months)
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={
              !selectedDelegation ||
              !selectedUtxo ||
              !fundingTx ||
              isSubmitting ||
              isBroadcasting ||
              isVerifying ||
              isFundingTxLoading
            }
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isVerifying
              ? "Waiting for Babylon confirmation..."
              : isBroadcasting
                ? "Broadcasting to Babylon..."
                : isSubmitting
                  ? "Creating Expansion Transaction..."
                  : isFundingTxLoading
                    ? "Loading Funding Transaction..."
                    : "Submit Expansion"}
          </button>
        </form>

        {verifiedDelegation && (
          <div className="mt-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
            <h3 className="font-medium mb-2">✅ Expansion Successful!</h3>
            <p className="text-sm mb-2">
              Your staking expansion has been verified by Babylon.
            </p>
            <p className="text-sm mb-3">
              <strong>Transaction:</strong>{" "}
              {verifiedDelegation.stakingTxHashHex?.slice(0, 16)}...
            </p>

            {btcBroadcastSuccess ? (
              <div className="space-y-2">
                <p className="text-sm mb-2">
                  ✅ Successfully broadcast to Bitcoin network!
                </p>
                <button
                  onClick={() => {
                    setVerifiedDelegation(null);
                    setBtcBroadcastSuccess(false);
                  }}
                  className="text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                >
                  Done
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm mb-2">
                  Ready to broadcast the staking transaction to Bitcoin network.
                </p>
                {error && (
                  <div className="p-2 bg-red-100 border border-red-400 text-red-700 rounded text-sm mb-2">
                    {error}
                  </div>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={handleBtcSignAndBroadcast}
                    disabled={!canSignExpansion || isBtcBroadcasting}
                    className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {isBtcBroadcasting
                      ? "Broadcasting..."
                      : "Sign + Broadcast to BTC"}
                  </button>
                  <button
                    onClick={() => {
                      setVerifiedDelegation(null);
                    }}
                    className="text-sm bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Container>
  );
};

export default StakingExpansion;
