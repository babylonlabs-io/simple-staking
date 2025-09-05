import { Select } from "@babylonlabs-io/core-ui";

import { useFinalityProviderState } from "@/ui/common/state/FinalityProviderState";

const options = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

export const FinalityProviderFilter = () => {
  const { filter, handleFilter } = useFinalityProviderState();

  return (
    <Select
      options={options}
      onSelect={(value) => handleFilter("status", value.toString())}
      placeholder="Select Status"
      value={filter.search ? "" : filter.status}
      disabled={Boolean(filter.search)}
      renderSelectedOption={(option) => `${option.label}`}
    />
  );
};
