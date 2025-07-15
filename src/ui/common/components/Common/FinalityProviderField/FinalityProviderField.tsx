import { useField } from "@babylonlabs-io/core-ui";
import { useMemo, useState } from "react";

import { SelectedProvidersList } from "@/ui/common/components/Multistaking/BsnFinalityProviderField/SelectedProvidersList";
import { ChainSelectionModal } from "@/ui/common/components/Multistaking/ChainSelectionModal/ChainSelectionModal";
import { CounterButton } from "@/ui/common/components/Multistaking/CounterButton";
import { FinalityProviderModal } from "@/ui/common/components/Multistaking/FinalityProviderField/FinalityProviderModal";
import { SubSection } from "@/ui/common/components/Multistaking/MultistakingForm/SubSection";
import { getNetworkConfigBBN } from "@/ui/common/config/network/bbn";
import { Bsn } from "@/ui/common/types/bsn";

interface Props {
  max: number;
  fieldName?: string;
  bsns?: Bsn[];
  loading?: boolean;
}

const { chainId: BBN_CHAIN_ID } = getNetworkConfigBBN();

enum ModalPage {
  DEFAULT,
  BSN,
  FINALITY_PROVIDER,
}

export function FinalityProviderField({
  max,
  fieldName = "finalityProviders",
  bsns = [],
  loading = false,
}: Props) {
  const { value: selectedProviderMap = {}, onChange } = useField<
    Record<string, string>
  >({
    name: fieldName,
    defaultValue: {},
  });

  const count = useMemo(
    () => Object.keys(selectedProviderMap).length,
    [selectedProviderMap],
  );

  const [modalPage, setModalPage] = useState<ModalPage>(ModalPage.DEFAULT);
  const [selectedBsnId, setSelectedBsnId] = useState<string | undefined>();

  const allowsMultipleBsns = max > 1;

  const handleAdd = (bsnId: string, providerPk: string) => {
    onChange({ ...selectedProviderMap, [bsnId]: providerPk });
    setModalPage(ModalPage.DEFAULT);
  };

  const handleRemove = (bsnId?: string) => {
    if (bsnId !== undefined) {
      const map = { ...selectedProviderMap };
      Reflect.deleteProperty(map, bsnId);
      onChange(map);
    }
  };

  const handleOpen = () => {
    if (allowsMultipleBsns) {
      setModalPage(ModalPage.BSN);
    } else {
      setSelectedBsnId(BBN_CHAIN_ID);
      setModalPage(ModalPage.FINALITY_PROVIDER);
    }
  };

  const handleClose = () => {
    setModalPage(ModalPage.DEFAULT);
    setSelectedBsnId(undefined);
  };

  const handleNext = () => {
    setModalPage(ModalPage.FINALITY_PROVIDER);
  };

  const handleSelectBsn = (chainId: string) => {
    setSelectedBsnId(chainId);
  };

  const handleBack = () => {
    if (allowsMultipleBsns) {
      setModalPage(ModalPage.BSN);
    } else {
      setModalPage(ModalPage.DEFAULT);
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
        loading={loading}
        open={modalPage === ModalPage.BSN}
        bsns={bsns}
        activeBsnId={selectedBsnId}
        selectedBsns={selectedProviderMap}
        onNext={handleNext}
        onClose={handleClose}
        onSelect={handleSelectBsn}
      />

      <FinalityProviderModal
        selectedBsnId={selectedBsnId}
        open={modalPage === ModalPage.FINALITY_PROVIDER}
        onClose={handleClose}
        onAdd={handleAdd}
        onBack={handleBack}
      />
    </SubSection>
  );
}
