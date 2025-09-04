import { Select } from "@babylonlabs-io/core-ui";
import { useMemo } from "react";

import { getBsnConfig } from "@/ui/common/api/getBsn";
import { useFinalityProviderBsnState } from "@/ui/common/state/FinalityProviderBsnState";

export const FinalityProviderFilter = () => {
  const { filter, handleFilter, selectedBsn } = useFinalityProviderBsnState();

  const bsnConfig = useMemo(() => getBsnConfig(selectedBsn), [selectedBsn]);

  const options = useMemo(
    () => bsnConfig.filterOptions,
    [bsnConfig.filterOptions],
  );

  return (
    <Select
      options={options}
      onSelect={(value) => handleFilter("providerStatus", value.toString())}
      placeholder="Select Status"
      value={filter.searchTerm ? "" : filter.providerStatus}
      disabled={Boolean(filter.searchTerm)}
      renderSelectedOption={(option) => `Showing ${option.label}`}
      className="h-10"
    />
  );
};
