import { useState } from "react";

import { ResponsiveDialog } from "@/ui/components/Modals/ResponsiveDialog";
import { ChainSelectionModal } from "@/ui/components/Multistaking/ChainSelectionModal/ChainSelectionModal";
import { FinalityProviderModal } from "@/ui/components/Multistaking/FinalityProviderField/FinalityProviderModal";
import { FinalityProviderState } from "@/ui/state/FinalityProviderState";

interface Props {
  open: boolean;
  onAdd: (selectedProviderPk: string) => void;
  onClose: () => void;
}

export function BsnModal({ open, onAdd, onClose }: Props) {
  const [selectedChainId, setSelectedChainId] = useState<string | null>(null);
  const [page, setPage] = useState<"CHAIN" | "FP">("CHAIN");

  const handleChainNext = (chainId: string) => {
    setSelectedChainId(chainId);
    setPage("FP");
  };

  const handleProviderAdd = (providerPk: string) => {
    onAdd(providerPk);
  };

  return (
    <ResponsiveDialog open={open} onClose={onClose} className="w-[52rem]">
      {page === "CHAIN" && (
        <ChainSelectionModal onNext={handleChainNext} onClose={onClose} />
      )}
      {page === "FP" && selectedChainId !== null && (
        <FinalityProviderState bsnId={selectedChainId}>
          <FinalityProviderModal
            open={true}
            defaultFinalityProvider=""
            onClose={onClose}
            onAdd={handleProviderAdd}
            onBack={() => setPage("CHAIN")}
          />
        </FinalityProviderState>
      )}
    </ResponsiveDialog>
  );
}
