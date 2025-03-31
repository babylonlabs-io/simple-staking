import { useCallback, useMemo, useState, type PropsWithChildren } from "react";

import { useCosmosWallet } from "@/app/context/wallet/CosmosWalletProvider";
import { useBbnQuery } from "@/app/hooks/client/rpc/queries/useBbnQuery";
import { retry } from "@/utils";
import { createStateUtils } from "@/utils/createStateUtils";

interface RewardsStateProps {
  loading: boolean;
  showRewardModal: boolean;
  processing: boolean;
  bbnAddress: string;
  rewardBalance: number;
  transactionFee: number;
  setTransactionFee: (value: number) => void;
  openRewardModal: () => void;
  closeRewardModal: () => void;
  setProcessing: (value: boolean) => void;
  refetchRewardBalance: () => Promise<void>;
}

const defaultState: RewardsStateProps = {
  loading: false,
  showRewardModal: false,
  processing: false,
  bbnAddress: "",
  rewardBalance: 0,
  transactionFee: 0,
  openRewardModal: () => {},
  closeRewardModal: () => {},
  setProcessing: () => {},
  setTransactionFee: () => {},
  refetchRewardBalance: () => Promise.resolve(),
};

const { StateProvider, useState: useRewardsState } =
  createStateUtils<RewardsStateProps>(defaultState);

export function RewardsState({ children }: PropsWithChildren) {
  const [showRewardModal, setRewardModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [transactionFee, setTransactionFee] = useState(0);

  const { bech32Address: bbnAddress } = useCosmosWallet();

  const {
    rewardsQuery: {
      data: rewardBalance = 0,
      isLoading: isRewardBalanceLoading,
      refetch: refetchRewards,
    },
    balanceQuery,
  } = useBbnQuery();

  const openRewardModal = useCallback(() => {
    setRewardModal(true);
  }, []);

  const closeRewardModal = useCallback(() => {
    setRewardModal(false);
  }, []);

  const refetchRewardBalance = useCallback(async () => {
    await refetchRewards();

    if (balanceQuery) {
      const initialBalance = balanceQuery.data || 0;

      await retry(
        () => {
          return balanceQuery.refetch().then(() => balanceQuery.data || 0);
        },
        (currentBalance) => currentBalance !== initialBalance,
        2e3, // 2 seconds polling interval
        10, // Maximum 10 attempts
      );
    }
  }, [refetchRewards, balanceQuery]);

  const context = useMemo(
    () => ({
      loading: isRewardBalanceLoading,
      showRewardModal,
      processing,
      bbnAddress,
      rewardBalance,
      transactionFee,
      setTransactionFee,
      setProcessing,
      openRewardModal,
      closeRewardModal,
      refetchRewardBalance,
    }),
    [
      isRewardBalanceLoading,
      showRewardModal,
      processing,
      bbnAddress,
      rewardBalance,
      transactionFee,
      openRewardModal,
      closeRewardModal,
      refetchRewardBalance,
    ],
  );

  return <StateProvider value={context}>{children}</StateProvider>;
}

export { useRewardsState };
