import { Select } from "@babylonlabs-io/bbn-core-ui";

import { useFinalityProviderState } from "@/app/state/FinalityProviderState";

const options = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

export const FinalityProviderFilter = () => {
  const { filterValue, handleFilter } = useFinalityProviderState();

  return (
    <Select
      options={options}
      onSelect={handleFilter}
      placeholder="Select Status"
      defaultValue={filterValue}
      renderSelectedOption={(option) => `Showing ${option.label}`}
    />
  );
};
