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
    selectedBsnIds,
    hasBabylonFinalityProviderSelected,
    setSelectedFinalityProviderIds,
  } = useFinalityProviderBsnState();

  // Debug logging
  console.log("🔍 BSN Modal Debug:", {
    selectedBsnIds: Array.from(selectedBsnIds),
    hasBabylonFinalityProviderSelected,
    disabledChainIds: Array.from(selectedBsnIds).filter((bsnId) => {
      if (hasBabylonFinalityProviderSelected) {
        return true;
      } else {
        return bsnId !== "";
      }
    }),
  });

  useEffect(() => {
    setSelectedFinalityProviderIds(new Set(selectedProviderIds));
  }, [selectedProviderIds, setSelectedFinalityProviderIds]);

  // Reset modal state when opening
  useEffect(() => {
    if (open) {
      setPage(BsnModalPage.CHAIN);
    }
  }, [open]);

  const handleClose = () => {
    setSelectedBsnId(null);
    setPage(BsnModalPage.CHAIN); // Reset page to CHAIN for next time
    // Only clean up the global selectedFinalityProviderIds state if no providers are selected
    // This prevents interference when the modal is closed without adding a provider
    if (selectedProviderIds.length === 0) {
      setSelectedFinalityProviderIds(new Set());
    }
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

  const handleBack = () => {
    setPage(BsnModalPage.CHAIN);
  };

  return (
    <ResponsiveDialog open={open} onClose={handleClose} className="w-[52rem]">
      {page === BsnModalPage.CHAIN && (
        <ChainSelectionModal
          onNext={handleChainNext}
          onClose={handleClose}
          disableNonBabylon={!hasBabylonFinalityProviderSelected}
          disabledChainIds={Array.from(selectedBsnIds).filter((bsnId) => {
            if (hasBabylonFinalityProviderSelected) {
              // If Babylon FP is selected, disable all BSNs that have FPs
              return true;
            } else {
              // If no Babylon FP, only disable non-Babylon BSNs that have FPs
              // Allow Babylon BSN to be selectable
              return bsnId !== "";
            }
          })}
        />
      )}
      {page === BsnModalPage.FP && selectedBsnId !== null && (
        <FinalityProviderModal
          open={true}
          defaultFinalityProvider=""
          onClose={handleClose}
          onAdd={handleProviderAdd}
          onBack={handleBack}
        />
      )}
    </ResponsiveDialog>
  );
}
