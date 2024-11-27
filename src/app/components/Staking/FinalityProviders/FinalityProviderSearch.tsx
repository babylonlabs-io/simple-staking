import { useDebounce } from "@uidotdev/usehooks";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { FiSearch } from "react-icons/fi";

interface FinalityProviderSearchProps {
  onSearch: (searchTerm: string) => void;
}

export const FinalityProviderSearch: React.FC<FinalityProviderSearchProps> = ({
  onSearch,
}) => {
  // Get the finality provider from the search params
  const searchParams = useSearchParams();
  const initialSearchFp = searchParams.get("fp");

  const [searchTerm, setSearchTerm] = useState(initialSearchFp);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    if (debouncedSearchTerm) {
      onSearch(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm, onSearch]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="w-full">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center justify-center w-10">
          <FiSearch className="text-sm md:text-lg" />
        </div>
        <input
          type="text"
          placeholder="Search by Name or Public Key"
          value={searchTerm ?? ""}
          onChange={handleSearch}
          className="w-full pl-10 pr-4 py-2 text-sm bg-transparent border-b border-gray-300 focus:outline-none focus:border-primary"
        />
      </div>
    </div>
  );
};
