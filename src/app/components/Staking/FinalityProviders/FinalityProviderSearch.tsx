import { Input } from "@babylonlabs-io/bbn-core-ui";
import { useCallback } from "react";
import { RiSearchLine } from "react-icons/ri";

import { useFinalityProviderV2State } from "@/app/state/FinalityProviderV2State";

export const FinalityProviderSearch = () => {
  const { handleSearch, searchValue } = useFinalityProviderV2State();

  const onSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleSearch(e.target.value);
    },
    [handleSearch],
  );

  const searchSuffix = (
    <span className="cursor-pointer">
      <RiSearchLine size={20} />
    </span>
  );

  return (
    <Input
      placeholder="Search by Name or Public Key"
      suffix={searchSuffix}
      value={searchValue}
      onChange={onSearchChange}
    />
  );
};
