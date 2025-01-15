import { Input } from "@babylonlabs-io/bbn-core-ui";
import Image from "next/image";
import { useCallback } from "react";
import { RiSearchLine } from "react-icons/ri";

import cancelCircle from "@/app/assets/cancel-circle.svg";
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
      className="flex items-center hover:opacity-80 transition-opacity"
    >
      <Image
        src={cancelCircle}
        alt="Clear search"
        width={18}
        height={18}
        className="opacity-50 hover:opacity-100 transition-opacity"
      />
    </button>
  ) : (
    <span className="text-primary-dark/50">
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
