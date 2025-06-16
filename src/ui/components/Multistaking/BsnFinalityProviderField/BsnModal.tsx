import { DialogBody, DialogHeader } from "@babylonlabs-io/core-ui";

import { ResponsiveDialog } from "@/ui/components/Modals/ResponsiveDialog";

interface Props {
  open: boolean;
  defaultFinalityProvider?: string;
  onAdd: () => void;
  onClose: () => void;
}

export function BsnModal({
  open,
  // defaultFinalityProvider,
  // onAdd,
  onClose,
}: Props) {
  return (
    <ResponsiveDialog open={open} onClose={onClose} className="w-[52rem]">
      <DialogHeader
        title="Select BSN and Finality Provider"
        onClose={onClose}
        className="text-accent-primary"
      />
      <DialogBody className="flex flex-col mb-4 mt-4 text-accent-primary">
        {/* TODO: Implement BSN selection functionality */}
      </DialogBody>
    </ResponsiveDialog>
  );
}
