import { useField } from "@babylonlabs-io/core-ui";
import { useMemo, useState } from "react";

import { CounterButton } from "@/ui/common/components/Multistaking/CounterButton";
import { SubSection } from "@/ui/common/components/Multistaking/MultistakingForm/SubSection";

import { GenericProviderModal } from "./GenericProviderModal";

interface Provider {
  id: string;
  name: string;
  description?: string;
}

interface Props {
  fieldName: string;
  max: number;
  title: string;
  providers: Provider[];
  modalTitle: string;
  modalDescription: string;
  loading?: boolean;
  renderProviderList?: (
    providers: Provider[],
    onSelect: (id: string) => void,
    selectedId?: string,
  ) => React.ReactNode;
}

export function GenericProviderField({
  fieldName,
  max,
  title,
  providers,
  modalTitle,
  modalDescription,
  loading = false,
  renderProviderList,
}: Props) {
  const { value: selectedProviderList = [], onChange } = useField<string[]>({
    name: fieldName,
    defaultValue: [],
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const count = useMemo(
    () => selectedProviderList.length,
    [selectedProviderList],
  );

  const handleAdd = (providerId: string) => {
    if (max === 1) {
      // For single selection, replace the current selection
      onChange([providerId]);
    } else {
      // For multiple selection, add to the list
      if (!selectedProviderList.includes(providerId)) {
        onChange([...selectedProviderList, providerId]);
      }
    }
    setIsModalOpen(false);
  };

  const handleRemove = (providerId: string) => {
    const updatedList = selectedProviderList.filter((id) => id !== providerId);
    onChange(updatedList);
  };

  const getProviderName = (providerId: string) => {
    const provider = providers.find((p) => p.id === providerId);
    return provider?.name || providerId;
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  return (
    <SubSection>
      <div className="flex flex-col w-full gap-4">
        <div className="flex flex-row">
          <div className="font-normal items-center flex flex-row justify-between w-full content-center">
            <span className="text-sm sm:text-base">{title}</span>
            <CounterButton counter={count} max={max} onAdd={handleOpenModal} />
          </div>
        </div>
        {count > 0 && (
          <div className="flex flex-col gap-2">
            {selectedProviderList.map((providerId) => (
              <div
                key={providerId}
                className="flex items-center justify-between p-2 bg-secondary rounded"
              >
                <span className="text-sm">{getProviderName(providerId)}</span>
                <button
                  onClick={() => handleRemove(providerId)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <GenericProviderModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalTitle}
        description={modalDescription}
        providers={providers}
        selectedProviders={selectedProviderList}
        loading={loading}
        onAdd={handleAdd}
        renderProviderList={renderProviderList}
      />
    </SubSection>
  );
}
