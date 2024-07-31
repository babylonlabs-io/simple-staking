import { useState } from "react";

import { SortField } from "@/app/components/Staking/FinalityProviders/FinalityProviders";

export const useMobileSortModal = () => {
  const [isSortModalOpen, setIsSortModalOpen] = useState(false);
  const [activeOrder, setActiveOrder] = useState(0);
  const [selectedCriterion, setSelectedCriterion] =
    useState<SortField>("stakeSat");

  const toggleSortModal = () => setIsSortModalOpen(!isSortModalOpen);

  return {
    isSortModalOpen,
    setIsSortModalOpen,
    activeOrder,
    setActiveOrder,
    selectedCriterion,
    setSelectedCriterion,
    toggleSortModal,
  };
};
