import { FinalityProviderSubsection, useField } from "@babylonlabs-io/core-ui";
import { Fragment, useMemo } from "react";

import { ChainSelectionModal } from "@/ui/common/components/Multistaking/ChainSelectionModal/ChainSelectionModal";
import { FinalityProviderModal } from "@/ui/common/components/Multistaking/FinalityProviderField/FinalityProviderModal";
import { getNetworkConfigBBN } from "@/ui/common/config/network/bbn";
import {
  StakingModalPage,
  useFinalityProviderBsnState,
} from "@/ui/common/state/FinalityProviderBsnState";
import { useFinalityProviderState } from "@/ui/common/state/FinalityProviderState";
import { useMultistakingState } from "@/ui/common/state/MultistakingState";

type SelectedProviderItemLocal = {
  bsnId: string;
  bsnName: string;
  bsnLogoUrl?: string;
  provider: any;
};

export function FinalityProvidersSection() {
  const { maxFinalityProviders } = useMultistakingState();

  // Determine if we should allow multiple BSNs
  // We allow multiple BSNs if maxFinalityProviders > 1 (feature flag enabled)
  const allowsMultipleBsns = maxFinalityProviders > 1;

  const { value: selectedProviderMap = {}, onChange } = useField<
    Record<string, string>
  >({
    name: "finalityProviders",
    defaultValue: {},
  });

  const {
    bsnList,
    bsnLoading,
    stakingModalPage,
    selectedBsnId,
    setStakingModalPage,
    setSelectedBsnId,
  } = useFinalityProviderBsnState();
  const { finalityProviderMap } = useFinalityProviderState();
  const { chainId: BBN_CHAIN_ID } = getNetworkConfigBBN();

  const selectedItems = useMemo<SelectedProviderItemLocal[]>(() => {
    const items = (Object.entries(selectedProviderMap) as [string, string][])
      .map(([bsnId, providerId]) => {
        const bsn = bsnList.find((b) => b.id === bsnId);
        const provider = finalityProviderMap.get(providerId);
        if (!provider) return null;

        return {
          bsnId,
          bsnName: bsn?.name || "",
          bsnLogoUrl: bsn?.logoUrl,
          provider,
        } as SelectedProviderItemLocal;
      })
      .filter(Boolean) as SelectedProviderItemLocal[];

    return items.sort((a, b) => {
      if (a.bsnId === BBN_CHAIN_ID) return -1;
      if (b.bsnId === BBN_CHAIN_ID) return 1;
      return 0;
    });
  }, [selectedProviderMap, bsnList, finalityProviderMap, BBN_CHAIN_ID]);

  const handleAdd = (bsnId: string, providerPk: string) => {
    const updated = { ...selectedProviderMap, [bsnId]: providerPk };
    onChange(updated);
    if (allowsMultipleBsns) {
      setStakingModalPage(StakingModalPage.BSN);
    } else {
      setStakingModalPage(StakingModalPage.DEFAULT);
    }
  };

  const handleRemove = (bsnId?: string) => {
    if (bsnId === undefined) return;
    const copy = { ...selectedProviderMap };
    Reflect.deleteProperty(copy, bsnId);
    onChange(copy);
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

  const handleNext = () =>
    setStakingModalPage(StakingModalPage.FINALITY_PROVIDER);
  const handleSelectBsn = (chainId: string) => setSelectedBsnId(chainId);
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
    <Fragment>
      <FinalityProviderSubsection
        max={allowsMultipleBsns ? maxFinalityProviders : 1}
        items={selectedItems}
        actionText={actionText}
        onAdd={handleOpen}
        onRemove={handleRemove}
      />

      <ChainSelectionModal
        loading={bsnLoading}
        open={stakingModalPage === StakingModalPage.BSN}
        bsns={bsnList}
        activeBsnId={selectedBsnId}
        selectedBsns={selectedProviderMap}
        onNext={handleNext}
        onClose={handleClose}
        onSelect={handleSelectBsn}
        onRemove={handleRemove}
      />

      <FinalityProviderModal
        selectedBsnId={selectedBsnId}
        open={stakingModalPage === StakingModalPage.FINALITY_PROVIDER}
        onClose={handleClose}
        onAdd={handleAdd}
        onBack={handleBack}
      />
    </Fragment>
  );
}
