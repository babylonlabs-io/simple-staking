import { Select } from "@babylonlabs-io/bbn-core-ui";

const options = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

export const FinalityProviderFilter = () => {
  return (
    <Select
      options={options}
      placeholder="Filter by status"
      selectWidth="200px"
    />
  );
};
