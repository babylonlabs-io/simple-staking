import { useCallback, useMemo, useState, type PropsWithChildren } from "react";

import { useCosmosWallet } from "@/app/context/wallet/CosmosWalletProvider";
import { useBbnQuery } from "@/app/hooks/client/rpc/queries/useBbnQuery";
import { createStateUtils } from "@/utils/createStateUtils";

import { useAppState } from ".";

interface RewardsStateProps {
  loading: boolean;
  showRewardModal: boolean;
  processing: boolean;
  bbnAddress: string;
  btcBalance: number;
  bbnBalance: number;
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
  btcBalance: 0,
  bbnBalance: 0,
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
  const { totalBalance: btcBalance, isLoading: isBTCBalanceLoading } =
    useAppState();
  const {
    balanceQuery: { data: bbnBalance = 0, isLoading: isCosmosBalanceLoading },
    rewardsQuery: {
      data: rewardBalance = 0,
      isLoading: isRewardBalanceLoading,
      refetch: refetchRewardBalance,
    },
  } = useBbnQuery();

  const loading =
    isBTCBalanceLoading || isCosmosBalanceLoading || isRewardBalanceLoading;

  const openRewardModal = useCallback(() => {
    setRewardModal(true);
  }, []);

  const closeRewardModal = useCallback(() => {
    setRewardModal(false);
  }, []);

  const context = useMemo(
    () => ({
      loading,
      showRewardModal,
      processing,
      bbnAddress,
      btcBalance,
      bbnBalance,
      rewardBalance,
      transactionFee,
      setTransactionFee,
      setProcessing,
      openRewardModal,
      closeRewardModal,
      refetchRewardBalance: async () => {
        await refetchRewardBalance();
      },
    }),
    [
      loading,
      showRewardModal,
      processing,
      bbnAddress,
      btcBalance,
      bbnBalance,
      rewardBalance,
      transactionFee,
      setTransactionFee,
      setProcessing,
      openRewardModal,
      closeRewardModal,
      refetchRewardBalance,
    ],
  );

  return <StateProvider value={context}>{children}</StateProvider>;
}

export { useRewardsState };
