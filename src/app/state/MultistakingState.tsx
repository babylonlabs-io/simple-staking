import { useCallback, useMemo, useState, type PropsWithChildren } from "react";

import { createStateUtils } from "@/utils/createStateUtils";

import { useFinalityProviderState } from "./FinalityProviderState";

export enum StakingModalPage {
  CHAIN_SELECTION = 0,
  FINALITY_PROVIDER = 1,
}
// TODO: This will be controlled by params
const MAX_FINALITY_PROVIDERS = 1;

interface MultistakingState {
  stakingModalPage: StakingModalPage;
  setStakingModalPage: (page: StakingModalPage) => void;
  selectedProviders: Array<any>;
  counter: number;
  selectedChain: string;
  setSelectedChain: (chain: string) => void;
  previewModalOpen: boolean;
  handleSelectProvider: (selectedProviderKey: string) => void;
  handlePreview: (data: any) => void;
  removeProvider: (index: number) => void;
  MAX_FINALITY_PROVIDERS: number;
}

const defaultState: MultistakingState = {
  stakingModalPage: StakingModalPage.FINALITY_PROVIDER,
  setStakingModalPage: () => {},
  selectedProviders: [],
  counter: 0,
  selectedChain: "babylon",
  setSelectedChain: () => {},
  previewModalOpen: false,
  handleSelectProvider: () => {},
  handlePreview: () => {},
  removeProvider: () => {},
  MAX_FINALITY_PROVIDERS,
};

const { StateProvider, useState: useMultistakingState } =
  createStateUtils<MultistakingState>(defaultState);

export function MultistakingState({ children }: PropsWithChildren) {
  const [stakingModalPage, setStakingModalPage] = useState<StakingModalPage>(
    StakingModalPage.FINALITY_PROVIDER,
  );
  const [selectedProviders, setSelectedProviders] = useState<Array<any>>([]);
  const [selectedChain, setSelectedChain] = useState<string>("babylon");
  const [counter, setCounter] = useState(0);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);

  const { finalityProviders } = useFinalityProviderState();

  const handleSelectProvider = useCallback(
    (selectedProviderKey: string) => {
      if (selectedProviderKey) {
        const providerData = finalityProviders?.find(
          (provider) => provider.btcPk === selectedProviderKey,
        );
        if (providerData) {
          setSelectedProviders((prev) => [
            ...prev,
            { ...providerData, chainType: selectedChain },
          ]);
          setCounter((prev) => prev + 1);
        }
      }
    },
    [finalityProviders, selectedChain],
  );

  const handlePreview = useCallback((data: any) => {
    setPreviewModalOpen(true);
  }, []);

  const removeProvider = useCallback((index: number) => {
    setSelectedProviders((prev) => {
      const updated = [...prev];
      updated.splice(index, 1);
      return updated;
    });
    setCounter((prev) => prev - 1);
  }, []);

  const context = useMemo(
    () => ({
      stakingModalPage,
      setStakingModalPage,
      selectedProviders,
      counter,
      selectedChain,
      setSelectedChain,
      previewModalOpen,
      handleSelectProvider,
      handlePreview,
      removeProvider,
      MAX_FINALITY_PROVIDERS,
    }),
    [
      stakingModalPage,
      selectedProviders,
      counter,
      selectedChain,
      previewModalOpen,
      handleSelectProvider,
      handlePreview,
      removeProvider,
    ],
  );

  return <StateProvider value={context}>{children}</StateProvider>;
}

export { useMultistakingState };
