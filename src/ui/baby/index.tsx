import { useState } from "react";

import { useCosmosWallet } from "@/ui/common/context/wallet/CosmosWalletProvider";
import { useBbnQuery } from "@/ui/legacy/hooks/client/rpc/queries/useBbnQuery";
import { useEpochingService } from "@/ui/legacy/hooks/services/useEpochingService";
import { babyToUbbn, ubbnToBaby } from "@/ui/legacy/utils/bbn";

export default function BabyStaking() {
  const cosmosWallet = useCosmosWallet();
  const { bech32Address, connected } = cosmosWallet;
  console.log({ cosmosWallet });
  const { stake, unstake, claimRewards } = useEpochingService();
  const { delegationsQuery, delegationRewardsQuery, validatorsQuery } =
    useBbnQuery();

  const [validatorAddress, setValidatorAddress] = useState("");
  const [stakeAmount, setStakeAmount] = useState("");
  const [unstakeAmount, setUnstakeAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const delegations = delegationsQuery.data || [];
  const rewards = delegationRewardsQuery.data || [];
  const validators = validatorsQuery.data || [];

  // Helper function to get rewards for a specific validator
  const getRewardsForValidator = (validatorAddress: string): number => {
    const validatorReward = rewards.find(
      (reward) => reward.validatorAddress === validatorAddress,
    );
    if (!validatorReward?.reward) return 0;

    return validatorReward.reward.reduce((total, coin) => {
      if (coin.denom === "ubbn") {
        return total + ubbnToBaby(parseFloat(coin.amount));
      }
      return total;
    }, 0);
  };

  const totalStaked = delegations.reduce((total, delegation) => {
    if (delegation.balance?.denom === "ubbn") {
      return total + ubbnToBaby(parseFloat(delegation.balance.amount));
    }
    return total;
  }, 0);

  const totalRewards = rewards.reduce((total, reward) => {
    return (
      total +
      (reward.reward || []).reduce((acc, coin) => {
        if (coin.denom === "ubbn") {
          return acc + ubbnToBaby(parseFloat(coin.amount));
        }
        return acc;
      }, 0)
    );
  }, 0);

  const handleStake = async () => {
    if (!validatorAddress || !stakeAmount) return;

    const tbabyAmount = parseFloat(stakeAmount);
    if (isNaN(tbabyAmount) || tbabyAmount <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    setLoading(true);
    try {
      const ubbnAmount = babyToUbbn(tbabyAmount);
      await stake(bech32Address, validatorAddress, {
        denom: "ubbn",
        amount: ubbnAmount.toString(),
      });
      alert(`Successfully staked ${tbabyAmount} tBABY!`);
      await delegationsQuery.refetch();
      await delegationRewardsQuery.refetch();
      setStakeAmount("");
    } catch (error: any) {
      alert(`Staking failed: ${error.message || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUnstake = async () => {
    if (!validatorAddress || !unstakeAmount) return;

    const tbabyAmount = parseFloat(unstakeAmount);
    if (isNaN(tbabyAmount) || tbabyAmount <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    setLoading(true);
    try {
      const ubbnAmount = babyToUbbn(tbabyAmount);
      await unstake(bech32Address, validatorAddress, {
        denom: "ubbn",
        amount: ubbnAmount.toString(),
      });
      alert(`Successfully unstaked ${tbabyAmount} tBABY!`);
      await delegationsQuery.refetch();
      await delegationRewardsQuery.refetch();
      setUnstakeAmount("");
    } catch (error: any) {
      alert(`Unstaking failed: ${error.message || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  const handleClaimRewards = async () => {
    if (!validatorAddress) return;

    setLoading(true);
    try {
      await claimRewards(bech32Address, validatorAddress);
      await delegationRewardsQuery.refetch();
      alert("Rewards claimed successfully!");
    } catch (error: any) {
      alert(`Failed to claim rewards: ${error.message || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  if (!connected) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
          <p className="text-gray-600">
            Please connect your Babylon wallet to use staking features.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8 text-center">Baby Staking</h1>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Wallet Info</h2>
        <p className="text-sm text-gray-600 mb-2">Address: {bech32Address}</p>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm font-medium">Active Delegations</p>
            <p className="text-lg font-bold">{delegations.length}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Total Staked</p>
            <p className="text-lg font-bold">
              {totalStaked.toLocaleString()} tBABY
            </p>
          </div>
          <div>
            <p className="text-sm font-medium">Total Rewards</p>
            <p className="text-lg font-bold text-green-600">
              {totalRewards.toLocaleString()} tBABY
            </p>
          </div>
          <div>
            <p className="text-sm font-medium">Available Validators</p>
            <p className="text-lg font-bold">{validators.length}</p>
          </div>
        </div>
      </div>

      {delegations.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">My Delegations</h2>
          <div className="space-y-2">
            {delegations.map((delegation, index) => {
              const validatorAddress =
                delegation.delegation?.validatorAddress || "";
              const stakedAmount = ubbnToBaby(
                parseFloat(delegation.balance?.amount || "0"),
              );
              const rewardsAmount = getRewardsForValidator(validatorAddress);

              return (
                <div
                  key={index}
                  className="flex justify-between items-center p-3 border rounded"
                >
                  <div>
                    <p className="font-medium">
                      {validators.find(
                        (v) => v.operatorAddress === validatorAddress,
                      )?.description?.moniker || validatorAddress}
                    </p>
                    <p className="text-sm text-gray-600">
                      Staked: {stakedAmount.toLocaleString()} tBABY
                    </p>
                    {rewardsAmount > 0 && (
                      <p className="text-sm text-green-600">
                        Rewards: {rewardsAmount.toLocaleString()} tBABY
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setValidatorAddress(validatorAddress);
                        setUnstakeAmount(stakedAmount.toString());
                      }}
                      className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                    >
                      Unstake All
                    </button>
                    {rewardsAmount > 0 && (
                      <button
                        onClick={async () => {
                          setValidatorAddress(validatorAddress);
                          await handleClaimRewards();
                        }}
                        disabled={loading}
                        className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 disabled:bg-gray-300"
                      >
                        {loading ? "Claiming..." : "Claim"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Stake Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Stake</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Validator
              </label>
              <select
                value={validatorAddress}
                onChange={(e) => setValidatorAddress(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a validator</option>
                {validators.map((validator) => (
                  <option
                    key={validator.operatorAddress}
                    value={validator.operatorAddress}
                  >
                    {validator.description?.moniker ||
                      validator.operatorAddress}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount (tBABY)
              </label>
              <input
                type="text"
                value={stakeAmount}
                onChange={(e) => setStakeAmount(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter tBABY amount to stake (e.g., 10)"
              />
            </div>
            <button
              onClick={handleStake}
              disabled={loading || !validatorAddress || !stakeAmount}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {loading ? "Staking..." : "Stake tBABY"}
            </button>
          </div>
        </div>

        {/* Unstake Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Unstake</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Validator
              </label>
              <select
                value={validatorAddress}
                onChange={(e) => setValidatorAddress(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="">Select a validator</option>
                {validators.map((validator) => (
                  <option
                    key={validator.operatorAddress}
                    value={validator.operatorAddress}
                  >
                    {validator.description?.moniker ||
                      validator.operatorAddress}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount (tBABY)
              </label>
              <input
                type="text"
                value={unstakeAmount}
                onChange={(e) => setUnstakeAmount(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Enter tBABY amount to unstake (e.g., 5)"
              />
            </div>
            <button
              onClick={handleUnstake}
              disabled={loading || !validatorAddress || !unstakeAmount}
              className="w-full bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {loading ? "Unstaking..." : "Unstake tBABY"}
            </button>
          </div>
        </div>

        {/* Rewards Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Rewards</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Validator
              </label>
              <select
                value={validatorAddress}
                onChange={(e) => setValidatorAddress(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Select a validator</option>
                {validators.map((validator) => (
                  <option
                    key={validator.operatorAddress}
                    value={validator.operatorAddress}
                  >
                    {validator.description?.moniker ||
                      validator.operatorAddress}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={handleClaimRewards}
              disabled={loading || !validatorAddress}
              className="w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {loading ? "Claiming..." : "Claim Rewards"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
