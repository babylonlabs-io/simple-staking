import { useField } from "@babylonlabs-io/core-ui";
import { useMemo } from "react";

import { CounterButton } from "@/ui/legacy/components/Multistaking/CounterButton";
import { getNetworkConfigBBN } from "@/ui/legacy/config/network/bbn";
import {
  StakingModalPage,
  useFinalityProviderBsnState,
} from "@/ui/legacy/state/FinalityProviderBsnState";

import { ChainSelectionModal } from "../ChainSelectionModal/ChainSelectionModal";
import { FinalityProviderModal } from "../FinalityProviderField/FinalityProviderModal";
import { SubSection } from "../MultistakingForm/SubSection";

import { SelectedProvidersList } from "./SelectedProvidersList";

interface Props {
  max: number;
}

const { chainId: BBN_CHAIN_ID } = getNetworkConfigBBN();

export function BsnFinalityProviderField({ max }: Props) {
  const { value: selectedProviderMap = {}, onChange } = useField<
    Record<string, string>
  >({
    name: "finalityProviders",
    defaultValue: {},
  });

  const count = useMemo(
    () => Object.keys(selectedProviderMap).length,
    [selectedProviderMap],
  );

  const {
    bsnList,
    bsnLoading,
    stakingModalPage,
    selectedBsnId,
    setStakingModalPage,
    setSelectedBsnId,
  } = useFinalityProviderBsnState();

  const allowsMultipleBsns = max > 1;

  const handleAdd = (selectedBsnId: string, providerPk: string) => {
    onChange({ ...selectedProviderMap, [selectedBsnId]: providerPk });
    setStakingModalPage(StakingModalPage.DEFAULT);
  };

  const handleRemove = (selectedBsnId?: string) => {
    if (selectedBsnId !== undefined) {
      const map = { ...selectedProviderMap };
      Reflect.deleteProperty(map, selectedBsnId);
      onChange(map);
    }
  };

  const handleOpen = () => {
    if (allowsMultipleBsns) {
      setStakingModalPage(StakingModalPage.BSN);
    } else {
      setSelectedBsnId(BBN_CHAIN_ID);
      setStakingModalPage(StakingModalPage.FINALITY_PROVIDER);
    }
  };

  const handleClose = () => {
    setStakingModalPage(StakingModalPage.DEFAULT);
    setSelectedBsnId(undefined);
  };

  const handleNext = () => {
    setStakingModalPage(StakingModalPage.FINALITY_PROVIDER);
  };

  const handleSelectBsn = (chainId: string) => {
    setSelectedBsnId(chainId);
  };

  const handleBack = () => {
    if (allowsMultipleBsns) {
      setStakingModalPage(StakingModalPage.BSN);
    } else {
      setStakingModalPage(StakingModalPage.DEFAULT);
    }
  };

  const actionText = allowsMultipleBsns
    ? "Add BSN and Finality Provider"
    : "Add Finality Provider";

  return (
    <SubSection>
      <div className="flex flex-col w-full gap-4">
        <div className="flex flex-row">
          <div className="font-normal items-center flex flex-row justify-between w-full content-center">
            <span className="text-sm sm:text-base">{actionText}</span>
            <CounterButton counter={count} max={max} onAdd={handleOpen} />
          </div>
        </div>
        {count > 0 && (
          <SelectedProvidersList
            selectedFPs={selectedProviderMap}
            onRemove={handleRemove}
          />
        )}
      </div>

      <ChainSelectionModal
        loading={bsnLoading}
        open={stakingModalPage === StakingModalPage.BSN}
        bsns={bsnList}
        activeBsnId={selectedBsnId}
        selectedBsns={selectedProviderMap}
        onNext={handleNext}
        onClose={handleClose}
        onSelect={handleSelectBsn}
      />

      <FinalityProviderModal
        selectedBsnId={selectedBsnId}
        open={stakingModalPage === StakingModalPage.FINALITY_PROVIDER}
        onClose={handleClose}
        onAdd={handleAdd}
        onBack={handleBack}
      />
    </SubSection>
  );
}
