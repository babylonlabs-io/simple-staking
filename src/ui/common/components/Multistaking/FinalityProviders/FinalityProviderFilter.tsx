import { Select } from "@babylonlabs-io/core-ui";

import { useFinalityProviderBsnState } from "@/ui/common/state/FinalityProviderBsnState";

const options = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

export const FinalityProviderFilter = () => {
  const { filter, handleFilter } = useFinalityProviderBsnState();

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
