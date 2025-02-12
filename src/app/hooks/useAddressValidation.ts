import { useCallback, useState } from "react";

export function useAddressValidation() {
  const [modalOpen, setModalOpen] = useState(false);

  const openValidationModal = useCallback(async () => {
    setModalOpen(true);
  }, [setModalOpen]);

  const closeValidationModal = useCallback(() => {
    setModalOpen(false);
  }, [setModalOpen]);

  return {
    open: modalOpen,
    openValidationModal,
    closeValidationModal,
  };
}
