import { useCallback, useMemo, useState, type PropsWithChildren } from "react";

import { useCosmosWallet } from "@/app/context/wallet/CosmosWalletProvider";
import { useBbnQuery } from "@/app/hooks/client/rpc/queries/useBbnQuery";
import { createStateUtils } from "@/utils/createStateUtils";

interface RewardsStateProps {
  loading: boolean;
  showRewardModal: boolean;
  showProcessingModal: boolean;
  showSuccessModal: boolean;
  processing: boolean;
  bbnAddress: string;
  rewardBalance: number;
  transactionFee: number;
  transactionHash: string;
  setTransactionHash: (hash: string) => void;
  setTransactionFee: (value: number) => void;
  openRewardModal: () => void;
  closeRewardModal: () => void;
  openProcessingModal: () => void;
  closeProcessingModal: () => void;
  openSuccessModal: () => void;
  closeSuccessModal: () => void;
  setProcessing: (value: boolean) => void;
  refetchRewardBalance: () => Promise<void>;
}

const defaultState: RewardsStateProps = {
  loading: false,
  showRewardModal: false,
  showProcessingModal: false,
  showSuccessModal: false,
  processing: false,
  bbnAddress: "",
  rewardBalance: 0,
  transactionFee: 0,
  transactionHash: "",
  setTransactionHash: () => {},
  openRewardModal: () => {},
  closeRewardModal: () => {},
  openProcessingModal: () => {},
  closeProcessingModal: () => {},
  openSuccessModal: () => {},
  closeSuccessModal: () => {},
  setProcessing: () => {},
  setTransactionFee: () => {},
  refetchRewardBalance: () => Promise.resolve(),
};

const { StateProvider, useState: useRewardsState } =
  createStateUtils<RewardsStateProps>(defaultState);

export function RewardsState({ children }: PropsWithChildren) {
  const [showRewardModal, setRewardModal] = useState(false);
  const [showProcessingModal, setProcessingModal] = useState(false);
  const [showSuccessModal, setSuccessModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [transactionFee, setTransactionFee] = useState(0);
  const [transactionHash, setTransactionHash] = useState("");

  const { bech32Address: bbnAddress } = useCosmosWallet();

  const {
    rewardsQuery: {
      data: rewardBalance = 0,
      isLoading: isRewardBalanceLoading,
      refetch: refetchRewardBalance,
    },
  } = useBbnQuery();

  const openRewardModal = useCallback(() => {
    setRewardModal(true);
  }, []);

  const closeRewardModal = useCallback(() => {
    setRewardModal(false);
  }, []);

  const openProcessingModal = useCallback(() => {
    setProcessingModal(true);
  }, []);

  const closeProcessingModal = useCallback(() => {
    setProcessingModal(false);
  }, []);

  const openSuccessModal = useCallback(() => {
    setSuccessModal(true);
  }, []);

  const closeSuccessModal = useCallback(() => {
    setSuccessModal(false);
    setTransactionHash("");
  }, []);

  const context = useMemo(
    () => ({
      loading: isRewardBalanceLoading,
      showRewardModal,
      showProcessingModal,
      showSuccessModal,
      processing,
      bbnAddress,
      rewardBalance,
      transactionFee,
      transactionHash,
      setTransactionHash,
      setTransactionFee,
      setProcessing,
      openRewardModal,
      closeRewardModal,
      openProcessingModal,
      closeProcessingModal,
      openSuccessModal,
      closeSuccessModal,
      refetchRewardBalance: async () => {
        await refetchRewardBalance();
      },
    }),
    [
      isRewardBalanceLoading,
      showRewardModal,
      showProcessingModal,
      showSuccessModal,
      processing,
      bbnAddress,
      rewardBalance,
      transactionFee,
      transactionHash,
      openRewardModal,
      closeRewardModal,
      openProcessingModal,
      closeProcessingModal,
      openSuccessModal,
      closeSuccessModal,
      refetchRewardBalance,
    ],
  );

  return <StateProvider value={context}>{children}</StateProvider>;
}

export { useRewardsState };
