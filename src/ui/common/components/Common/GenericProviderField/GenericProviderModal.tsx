import {
  Button,
  DialogBody,
  DialogFooter,
  DialogHeader,
} from "@babylonlabs-io/core-ui";
import { useState } from "react";

import { ResponsiveDialog } from "@/ui/common/components/Modals/ResponsiveDialog";

interface Provider {
  id: string;
  name: string;
  description?: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  description: string;
  providers: Provider[];
  selectedProviders: string[];
  loading?: boolean;
  onAdd: (providerId: string) => void;
  renderProviderList?: (
    providers: Provider[],
    onSelect: (id: string) => void,
    selectedId?: string,
  ) => React.ReactNode;
}

export const GenericProviderModal = ({
  open,
  onClose,
  title,
  description,
  providers,
  loading = false,
  onAdd,
  renderProviderList,
}: Props) => {
  const [selectedProvider, setSelectedProvider] = useState<string>("");

  const handleClose = () => {
    onClose();
    setSelectedProvider("");
  };

  const handleAdd = () => {
    if (selectedProvider) {
      onAdd(selectedProvider);
      handleClose();
    }
  };

  const defaultProviderList = (
    providers: Provider[],
    onSelect: (id: string) => void,
    selectedId?: string,
  ) => (
    <div className="space-y-2">
      {providers.map((provider) => (
        <div
          key={provider.id}
          className={`p-4 border rounded cursor-pointer transition-colors ${
            selectedId === provider.id
              ? "border-primary bg-primary/10"
              : "border-border hover:bg-secondary"
          }`}
          onClick={() => onSelect(provider.id)}
        >
          <div className="font-medium">{provider.name}</div>
          {provider.description && (
            <div className="text-sm text-muted-foreground mt-1">
              {provider.description}
            </div>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <ResponsiveDialog open={open} onClose={handleClose} className="w-[52rem]">
      <DialogHeader
        title={title}
        onClose={handleClose}
        className="text-accent-primary"
      />

      <DialogBody className="flex flex-col mb-4 mt-4 text-accent-primary">
        <div className="mb-4">{description}</div>
        <div className="overflow-x-auto flex flex-col gap-2">
          {renderProviderList
            ? renderProviderList(
                providers,
                setSelectedProvider,
                selectedProvider,
              )
            : defaultProviderList(
                providers,
                setSelectedProvider,
                selectedProvider,
              )}
        </div>
      </DialogBody>

      <DialogFooter className="flex justify-end">
        <Button
          variant="contained"
          onClick={handleAdd}
          disabled={!selectedProvider || loading}
        >
          Add
        </Button>
      </DialogFooter>
    </ResponsiveDialog>
  );
};
