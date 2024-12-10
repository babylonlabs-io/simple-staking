import { Select } from "@babylonlabs-io/bbn-core-ui";

import { useFinalityProviderService } from "@/app/hooks/services/useFinalityProviderService";

const options = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

export const FinalityProviderFilter = () => {
  const { filterValue, handleFilter } = useFinalityProviderService();

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
