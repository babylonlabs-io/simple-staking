import { Select } from "@babylonlabs-io/bbn-core-ui";

import { useFinalityProviderState } from "@/app/state/FinalityProviderState";

const options = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

export const FinalityProviderFilter = () => {
  const { filterValue, handleFilter, searchValue } = useFinalityProviderState();

  return (
    <Select
      options={options}
      onSelect={handleFilter}
      placeholder="Select Status"
      value={searchValue ? "" : filterValue}
      disabled={Boolean(searchValue)}
      renderSelectedOption={(option) => `Showing ${option.label}`}
    />
  );
};
