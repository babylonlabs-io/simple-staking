import { useEffect, useState } from "react";

import { ResponsiveDialog } from "@/ui/components/Modals/ResponsiveDialog";
import { ChainSelectionModal } from "@/ui/components/Multistaking/ChainSelectionModal/ChainSelectionModal";
import { FinalityProviderModal } from "@/ui/components/Multistaking/FinalityProviderField/FinalityProviderModal";
import { useLogger } from "@/ui/hooks/useLogger";
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
  const logger = useLogger();

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
    logger.info("Proceeding to FP selection", { chainId });
    setSelectedBsnId(chainId);
    setPage(BsnModalPage.FP);
  };

  const handleProviderAdd = (providerPk: string) => {
    logger.info("FP selected", {
      providerPk: providerPk.substring(0, 8) + "...",
    });
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
