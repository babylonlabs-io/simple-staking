import { IconButton } from "@babylonlabs-io/core-ui";
import { useState } from "react";
import { IoGridSharp } from "react-icons/io5";
import { MdTableRows } from "react-icons/md";

import { FinalityProviderFilter } from "@/ui/common/components/Multistaking/FinalityProviders/FinalityProviderFilter";
import { FinalityProviderSearch } from "@/ui/common/components/Multistaking/FinalityProviders/FinalityProviderSearch";
import { FinalityProviderTable } from "@/ui/common/components/Multistaking/FinalityProviders/FinalityProviderTable";

interface Props {
  selectedFP: string;
  onChange: (value: string) => void;
}

export const FinalityProviders = ({ selectedFP, onChange }: Props) => {
  const [layout, setLayout] = useState<"grid" | "list">("grid");

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <FinalityProviderSearch />
        </div>
        <div className="w-full md:w-[200px]">
          <FinalityProviderFilter />
        </div>
        <div className="flex items-center gap-2 text-secondary-strokeDark/50">
          <IconButton
            onClick={() => setLayout(layout === "grid" ? "list" : "grid")}
          >
            <div className="text-accent-primary">
              {layout === "grid" ? (
                <MdTableRows size={24} />
              ) : (
                <IoGridSharp size={20} />
              )}
            </div>
          </IconButton>
        </div>
      </div>

      <FinalityProviderTable
        selectedFP={selectedFP}
        onSelectRow={onChange}
        layout={layout}
      />
    </div>
  );
};
