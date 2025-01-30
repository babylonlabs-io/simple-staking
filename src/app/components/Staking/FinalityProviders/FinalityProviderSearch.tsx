import { Input } from "@babylonlabs-io/bbn-core-ui";
import { useCallback } from "react";
import { MdCancel } from "react-icons/md";
import { RiSearchLine } from "react-icons/ri";

import { useFinalityProviderState } from "@/app/state/FinalityProviderState";

export const FinalityProviderSearch = () => {
  const { filter, handleFilter } = useFinalityProviderState();

  const onSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFilter("search", e.target.value);
    },
    [handleFilter],
  );

  const onClearSearch = useCallback(() => {
    handleFilter("search", "");
  }, [handleFilter]);

  const searchSuffix = filter.search ? (
    <button
      onClick={onClearSearch}
      className="opacity-60 hover:opacity-100 transition-opacity"
    >
      <MdCancel size={18} className="text-secondary-strokeDark" />
    </button>
  ) : (
    <span className="text-secondary-strokeDark">
      <RiSearchLine size={20} />
    </span>
  );

  return (
    <Input
      placeholder="Search by Name or Public Key"
      suffix={searchSuffix}
      value={filter.search}
      onChange={onSearchChange}
    />
  );
};
