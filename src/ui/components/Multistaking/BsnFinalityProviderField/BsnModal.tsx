import { useEffect, useMemo, useState } from "react";

import { ResponsiveDialog } from "@/ui/components/Modals/ResponsiveDialog";
import { ChainSelectionModal } from "@/ui/components/Multistaking/ChainSelectionModal/ChainSelectionModal";
import { FinalityProviderModal } from "@/ui/components/Multistaking/FinalityProviderField/FinalityProviderModal";
import {
  FinalityProviderState,
  useFinalityProviderState,
} from "@/ui/state/FinalityProviderState";

interface Props {
  open: boolean;
  onAdd: (selectedProviderPk: string) => void;
  onClose: () => void;
  selectedProviderIds: string[];
}

enum BsnModalPage {
  CHAIN = "CHAIN",
  FP = "FP",
}

export function BsnModal({ open, onAdd, onClose, selectedProviderIds }: Props) {
  const [selectedChainId, setSelectedChainId] = useState<string | null>(null);
  const [page, setPage] = useState<BsnModalPage>(BsnModalPage.CHAIN);

  const { getRegisteredFinalityProvider } = useFinalityProviderState();

  const hasBabylonProvider = useMemo(
    () =>
      selectedProviderIds.some((pk) => {
        const fp = getRegisteredFinalityProvider(pk);
        return !fp?.bsnId;
      }),
    [selectedProviderIds, getRegisteredFinalityProvider],
  );

  const disabledChainIds = useMemo(() => {
    const set = new Set<string>();
    selectedProviderIds.forEach((pk) => {
      const fp = getRegisteredFinalityProvider(pk);
      set.add(fp?.bsnId || "");
    });
    return Array.from(set);
  }, [selectedProviderIds, getRegisteredFinalityProvider]);

  useEffect(() => {
    if (!open) {
      return;
    }
    setPage(BsnModalPage.CHAIN);
    setSelectedChainId(null);
  }, [open]);

  const handleChainNext = (chainId: string) => {
    setSelectedChainId(chainId);
    setPage(BsnModalPage.FP);
  };

  const handleProviderAdd = (providerPk: string) => {
    onAdd(providerPk);
  };

  return (
    <ResponsiveDialog open={open} onClose={onClose} className="w-[52rem]">
      {page === BsnModalPage.CHAIN && (
        <ChainSelectionModal
          onNext={handleChainNext}
          onClose={onClose}
          disableNonBabylon={!hasBabylonProvider}
          disabledChainIds={disabledChainIds}
        />
      )}
      {page === BsnModalPage.FP && selectedChainId !== null && (
        <FinalityProviderState bsnId={selectedChainId}>
          <FinalityProviderModal
            open={true}
            defaultFinalityProvider=""
            onClose={onClose}
            onAdd={handleProviderAdd}
            onBack={() => setPage(BsnModalPage.CHAIN)}
          />
        </FinalityProviderState>
      )}
    </ResponsiveDialog>
  );
}
