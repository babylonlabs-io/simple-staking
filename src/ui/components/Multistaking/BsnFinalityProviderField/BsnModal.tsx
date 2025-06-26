import { useEffect, useState } from "react";

import { ResponsiveDialog } from "@/ui/components/Modals/ResponsiveDialog";
import { ChainSelectionModal } from "@/ui/components/Multistaking/ChainSelectionModal/ChainSelectionModal";
import { FinalityProviderModal } from "@/ui/components/Multistaking/FinalityProviderField/FinalityProviderModal";
import { useFinalityProviderBsnState } from "@/ui/state/FinalityProviderBsnState";

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
  const [page, setPage] = useState<BsnModalPage>(BsnModalPage.CHAIN);

  const {
    setSelectedBsnId,
    selectedBsnId,
    hasBabylonProviderFlag,
    disabledChainIds,
    setSelectedProviderIds,
  } = useFinalityProviderBsnState();

  useEffect(() => {
    setSelectedProviderIds(selectedProviderIds);
  }, [selectedProviderIds, setSelectedProviderIds]);

  const handleClose = () => {
    setSelectedBsnId(null);
    onClose();
  };

  const handleChainNext = (chainId: string) => {
    setSelectedBsnId(chainId);
    setPage(BsnModalPage.FP);
  };

  const handleProviderAdd = (providerPk: string) => {
    onAdd(providerPk);
  };

  return (
    <ResponsiveDialog open={open} onClose={handleClose} className="w-[52rem]">
      {page === BsnModalPage.CHAIN && (
        <ChainSelectionModal
          onNext={handleChainNext}
          onClose={handleClose}
          disableNonBabylon={!hasBabylonProviderFlag}
          disabledChainIds={disabledChainIds}
        />
      )}
      {page === BsnModalPage.FP && selectedBsnId !== null && (
        <FinalityProviderModal
          open={true}
          defaultFinalityProvider=""
          onClose={handleClose}
          onAdd={handleProviderAdd}
          onBack={() => setPage(BsnModalPage.CHAIN)}
        />
      )}
    </ResponsiveDialog>
  );
}
