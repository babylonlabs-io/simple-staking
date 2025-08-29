import { Select } from "@babylonlabs-io/core-ui";

import { useFinalityProviderBsnState } from "@/ui/common/state/FinalityProviderBsnState";

const options = [
  { value: "", label: "All Providers" },
  { value: "allowlisted", label: "Allowlisted" },
  { value: "not-allowlisted", label: "Not Allowlisted" },
];

export const FinalityProviderAllowlistFilter = () => {
  const { filter, handleFilter, selectedBsnId } = useFinalityProviderBsnState();

  // Only show allowlist filter for non-Babylon BSNs
  if (!selectedBsnId || selectedBsnId === "babylon") {
    return null;
  }

  return (
    <Select
      options={options}
      onSelect={(value) => handleFilter("allowlistStatus", value.toString())}
      placeholder="Filter by Allowlist"
      value={filter.allowlistStatus}
      disabled={Boolean(filter.searchTerm)}
      renderSelectedOption={(option) =>
        option.value ? `Showing ${option.label}` : "All Providers"
      }
      className="h-10"
    />
  );
};
