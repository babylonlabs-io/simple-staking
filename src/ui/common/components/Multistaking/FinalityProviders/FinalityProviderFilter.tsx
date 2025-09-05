import { Select } from "@babylonlabs-io/core-ui";

import { useFinalityProviderBsnState } from "@/ui/common/state/FinalityProviderBsnState";

export const FinalityProviderFilter = () => {
  const { filter, handleFilter, filterOptions } = useFinalityProviderBsnState();

  return (
    <Select
      options={filterOptions}
      onSelect={(value) => handleFilter("providerStatus", value.toString())}
      placeholder="Select Status"
      value={filter.searchTerm ? "" : filter.providerStatus}
      disabled={Boolean(filter.searchTerm)}
      renderSelectedOption={(option) => `Showing ${option.label}`}
      className="h-10"
    />
  );
};
