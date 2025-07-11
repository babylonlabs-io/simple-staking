import { FinalityProviderFilter } from "@/ui/common/components/Multistaking/FinalityProviders/FinalityProviderFilter";
import { FinalityProviderSearch } from "@/ui/common/components/Multistaking/FinalityProviders/FinalityProviderSearch";
import { FinalityProviderTable } from "@/ui/common/components/Multistaking/FinalityProviders/FinalityProviderTable";

interface Props {
  selectedFP: string;
  onChange: (value: string) => void;
}

export const FinalityProviders = ({ selectedFP, onChange }: Props) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <FinalityProviderSearch />
        </div>
        <div className="w-full md:w-[200px]">
          <FinalityProviderFilter />
        </div>
      </div>

      <FinalityProviderTable selectedFP={selectedFP} onSelectRow={onChange} />
    </div>
  );
};
