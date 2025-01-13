import { Select } from "@babylonlabs-io/bbn-core-ui";

import { useFinalityProviderV2State } from "@/app/state/FinalityProviderV2State";

const options = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

export const FinalityProviderFilter = () => {
  const { filterValue, handleFilter } = useFinalityProviderV2State();

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
