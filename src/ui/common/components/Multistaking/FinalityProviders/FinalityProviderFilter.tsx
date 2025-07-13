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
      onSelect={(value) => handleFilter("status", value.toString())}
      placeholder="Select Status"
      value={filter.search ? "" : filter.status}
      disabled={Boolean(filter.search)}
      renderSelectedOption={(option) => `Showing ${option.label}`}
    />
  );
};
