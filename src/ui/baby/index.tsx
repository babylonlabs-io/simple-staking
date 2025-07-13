import { useState } from "react";

import { Container } from "@/ui/common/components/Container/Container";
import { Stats, type StatItemData } from "@/ui/common/components/Stats/Stats";
import { useCosmosWallet } from "@/ui/common/context/wallet/CosmosWalletProvider";
import { useBbnQuery } from "@/ui/legacy/hooks/client/rpc/queries/useBbnQuery";
import { useEpochingService } from "@/ui/legacy/hooks/services/useEpochingService";
import { babyToUbbn, ubbnToBaby } from "@/ui/legacy/utils/bbn";

import { DelegationsList } from "./components/DelegationsList";
import { RewardsForm } from "./components/RewardsForm";
import { StakeForm } from "./components/StakeForm";
import { UnstakeForm } from "./components/UnstakeForm";

export default function BabyStaking() {
  const cosmosWallet = useCosmosWallet();
  const { bech32Address } = cosmosWallet;
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

  const handleUnstakeAll = (validatorAddr: string, amount: string) => {
    setValidatorAddress(validatorAddr);
    setUnstakeAmount(amount);
  };

  const handleClaimRewardsForValidator = async (validatorAddr: string) => {
    setValidatorAddress(validatorAddr);
    await handleClaimRewards();
  };

  const statsItems: StatItemData[] = [
    {
      title: "Active Delegations",
      value: delegations.length.toString(),
    },
    {
      title: "Total Staked",
      value: `${totalStaked.toLocaleString()} tBABY`,
    },
    {
      title: "Total Rewards",
      value: `${totalRewards.toLocaleString()} tBABY`,
    },
    {
      title: "Available Validators",
      value: validators.length.toString(),
    },
  ];

  return (
    <Container
      as="main"
      className="-mt-[10rem] flex flex-col gap-[3rem] pb-16 max-w-[760px] mx-auto flex-1"
    >
      <Stats title="Babylon Stats" items={statsItems} />

      <DelegationsList
        delegations={delegations}
        validators={validators}
        getRewardsForValidator={getRewardsForValidator}
        onUnstakeAll={handleUnstakeAll}
        onClaimRewards={handleClaimRewardsForValidator}
        loading={loading}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StakeForm
          validators={validators}
          validatorAddress={validatorAddress}
          setValidatorAddress={setValidatorAddress}
          stakeAmount={stakeAmount}
          setStakeAmount={setStakeAmount}
          onStake={handleStake}
          loading={loading}
        />

        <UnstakeForm
          validators={validators}
          validatorAddress={validatorAddress}
          setValidatorAddress={setValidatorAddress}
          unstakeAmount={unstakeAmount}
          setUnstakeAmount={setUnstakeAmount}
          onUnstake={handleUnstake}
          loading={loading}
        />

        <RewardsForm
          validators={validators}
          validatorAddress={validatorAddress}
          setValidatorAddress={setValidatorAddress}
          onClaimRewards={handleClaimRewards}
          loading={loading}
        />
      </div>
    </Container>
  );
}
