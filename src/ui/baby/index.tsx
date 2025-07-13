import { useState } from "react";

import { Container } from "@/ui/common/components/Container/Container";
import { Stats, type StatItemData } from "@/ui/common/components/Stats/Stats";
import { Tabs } from "@/ui/common/components/Tabs";
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
  const { unstake, claimRewards } = useEpochingService();
  const { delegationsQuery, delegationRewardsQuery, validatorsQuery } =
    useBbnQuery();

  const [validatorAddress, setValidatorAddress] = useState("");
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

  const handleStakeSuccess = async () => {
    try {
      await delegationsQuery.refetch();
      await delegationRewardsQuery.refetch();
      // Success notification can be added here
    } catch (error) {
      console.error("Error refetching data:", error);
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

  const tabItems = [
    {
      id: "stake",
      label: "Stake",
      content: (
        <StakeForm
          validators={validators}
          onStakeSuccess={handleStakeSuccess}
        />
      ),
    },
    {
      id: "unstake",
      label: "Unstake",
      content: (
        <UnstakeForm
          validators={validators}
          validatorAddress={validatorAddress}
          setValidatorAddress={setValidatorAddress}
          unstakeAmount={unstakeAmount}
          setUnstakeAmount={setUnstakeAmount}
          onUnstake={handleUnstake}
          loading={loading}
        />
      ),
    },
    {
      id: "rewards",
      label: "Claim Rewards",
      content: (
        <RewardsForm
          validators={validators}
          validatorAddress={validatorAddress}
          setValidatorAddress={setValidatorAddress}
          onClaimRewards={handleClaimRewards}
          loading={loading}
        />
      ),
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

      <Tabs items={tabItems} defaultActiveTab="stake" className="w-full" />
    </Container>
  );
}
