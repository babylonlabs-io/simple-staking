import { SignPsbtOptions } from "@babylonlabs-io/wallet-connector";
import { useCallback, useMemo, useState, type PropsWithChildren } from "react";

import { createStateUtils } from "@/app/utils/createStateUtils";

import type { FinalityProvider } from "../types/finalityProviders";

import { useFinalityProviderState } from "./FinalityProviderState";
import { StakingModalPage } from "./StakingState";

export interface MultistakingState {
  isModalOpen: boolean;
  setIsModalOpen: (value: boolean) => void;
  stakingModalPage: StakingModalPage;
  setStakingModalPage: (page: StakingModalPage) => void;
  selectedProviders: (FinalityProvider & { chainType: string })[];
  handleSelectProvider: (selectedProviderKey: string) => void;
  removeProvider: (providerId: string) => void;
  selectedChain: string;
  setSelectedChain: (chain: string) => void;
  MAX_FINALITY_PROVIDERS: number;
  currentStakingStepOptions: SignPsbtOptions | undefined;
  setCurrentStakingStepOptions: (options?: SignPsbtOptions) => void;
  isMaxBalanceMode: boolean;
  setIsMaxBalanceMode: (value: boolean) => void;
}

const { StateProvider, useState: useMultistakingState } =
  createStateUtils<MultistakingState>({
    isModalOpen: false,
    setIsModalOpen: () => {},
    stakingModalPage: StakingModalPage.FINALITY_PROVIDER,
    setStakingModalPage: () => {},
    selectedProviders: [],
    handleSelectProvider: () => {},
    removeProvider: () => {},
    selectedChain: "babylon",
    setSelectedChain: () => {},
    MAX_FINALITY_PROVIDERS: 1,
    currentStakingStepOptions: undefined,
    setCurrentStakingStepOptions: () => {},
    isMaxBalanceMode: false,
    setIsMaxBalanceMode: () => {},
  });

export function MultistakingState({ children }: PropsWithChildren) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [stakingModalPage, setStakingModalPage] = useState<StakingModalPage>(
    StakingModalPage.FINALITY_PROVIDER,
  );
  const [selectedChain, setSelectedChain] = useState("babylon");
  const [selectedProviders, setSelectedProviders] = useState<
    (FinalityProvider & { chainType: string })[]
  >([]);
  const [currentStakingStepOptions, setCurrentStakingStepOptions] =
    useState<SignPsbtOptions>();
  const [isMaxBalanceMode, setIsMaxBalanceMode] = useState(false);

  const MAX_FINALITY_PROVIDERS = 1;

  const { finalityProviders } = useFinalityProviderState();

  const handleSelectProvider = useCallback(
    (selectedProviderKey: string) => {
      if (selectedProviderKey) {
        const providerData = finalityProviders?.find(
          (p) => p.btcPk === selectedProviderKey,
        );
        if (providerData) {
          setSelectedProviders((prev) => [
            ...prev,
            { ...providerData, chainType: selectedChain },
          ]);
        }
      }
      setIsModalOpen(false);
    },
    [finalityProviders, selectedChain],
  );

  const removeProvider = useCallback((providerId: string) => {
    setSelectedProviders((prev) => prev.filter((p) => p.id !== providerId));
  }, []);

  const context = useMemo(
    () => ({
      isModalOpen,
      setIsModalOpen,
      stakingModalPage,
      setStakingModalPage,
      selectedProviders,
      handleSelectProvider,
      removeProvider,
      selectedChain,
      setSelectedChain,
      MAX_FINALITY_PROVIDERS,
      currentStakingStepOptions,
      setCurrentStakingStepOptions,
      isMaxBalanceMode,
      setIsMaxBalanceMode,
    }),
    [
      isModalOpen,
      setIsModalOpen,
      stakingModalPage,
      setStakingModalPage,
      selectedProviders,
      handleSelectProvider,
      removeProvider,
      selectedChain,
      setSelectedChain,
      MAX_FINALITY_PROVIDERS,
      currentStakingStepOptions,
      setCurrentStakingStepOptions,
      isMaxBalanceMode,
      setIsMaxBalanceMode,
    ],
  );

  return <StateProvider value={context}>{children}</StateProvider>;
}

export { useMultistakingState };
