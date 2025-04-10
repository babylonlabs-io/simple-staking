import { Select } from "@babylonlabs-io/core-ui";
import { useCallback, useEffect, useRef } from "react";

import { useFinalityProviderState } from "@/app/state/FinalityProviderState";
import { FinalityProviderState as FinalityProviderStateEnum } from "@/app/types/finalityProviders";

const options = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

export const FinalityProviderFilter = () => {
  const { filter, handleFilter, isFetching, finalityProviderMap } =
    useFinalityProviderState();

  const initialCheckDone = useRef(false);

  const hasActiveProviders = useCallback(() => {
    return Array.from(finalityProviderMap.values()).some(
      (provider) => provider.state === FinalityProviderStateEnum.ACTIVE,
    );
  }, [finalityProviderMap]);

  useEffect(() => {
    if (
      !initialCheckDone.current &&
      !isFetching &&
      filter.status === "active" &&
      finalityProviderMap.size > 0
    ) {
      initialCheckDone.current = true;
      if (!hasActiveProviders()) {
        handleFilter("status", "inactive");
      }
    }
  }, [
    filter.status,
    hasActiveProviders,
    handleFilter,
    isFetching,
    finalityProviderMap,
  ]);

  return (
    <Select
      options={options}
      onSelect={(value) => handleFilter("status", value.toString())}
      placeholder="Select Status"
      value={filter.search ? "" : filter.status}
      disabled={Boolean(filter.search)}
      renderSelectedOption={(option) => `Showing ${option.label}`}
    />
  );
};
