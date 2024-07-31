import { useDebounce } from "@uidotdev/usehooks";
import { useCallback, useEffect, useState } from "react";

import {
  SortDirection,
  SortField,
} from "@/app/components/Staking/FinalityProviders/FinalityProviders";

export const useFinalityProvidersSort = (
  setSortField: (field: SortField) => void,
  setSortDirection: (direction: SortDirection) => void,
) => {
  const [visualSortField, setVisualSortField] = useState<SortField>("stakeSat");
  const [visualSortDirection, setVisualSortDirection] =
    useState<SortDirection>("desc");
  const [debouncedSortField, setDebouncedSortField] =
    useState<SortField>("stakeSat");
  const [debouncedSortDirection, setDebouncedSortDirection] =
    useState<SortDirection>("desc");

  const debouncedSort = useDebounce(
    { field: debouncedSortField, direction: debouncedSortDirection },
    300,
  );

  useEffect(() => {
    if (debouncedSort) {
      setSortField(debouncedSort.field);
      setSortDirection(debouncedSort.direction);
    }
  }, [debouncedSort, setSortField, setSortDirection]);

  const handleSort = useCallback(
    (field: SortField) => {
      let newDirection: SortDirection;
      if (field === visualSortField) {
        newDirection = visualSortDirection === "asc" ? "desc" : "asc";
        setVisualSortDirection(newDirection);
      } else {
        newDirection = "asc";
        setVisualSortField(field);
        setVisualSortDirection(newDirection);
      }
      setDebouncedSortField(field);
      setDebouncedSortDirection(newDirection);
    },
    [visualSortField, visualSortDirection],
  );

  const handleMobileSort = useCallback(
    (order: SortDirection, criteria: SortField) => {
      setVisualSortField(criteria);
      setVisualSortDirection(order);
      setDebouncedSortField(criteria);
      setDebouncedSortDirection(order);
    },
    [],
  );

  return {
    visualSortField,
    visualSortDirection,
    handleSort,
    handleMobileSort,
  };
};
