import { FinalityProviderFilter } from "./FinalityProviderFilter";
import { FinalityProviderSearch } from "./FinalityProviderSearch";
import { FinalityProviderSubtitle } from "./FinalityProviderSubtitle";
import { FinalityProviderTable } from "./FinalityProviderTable";
import { FinalityProviderTitle } from "./FinalityProviderTitle";

export const FinalityProviders = () => {
  return (
    <div className="flex flex-col gap-4">
      <FinalityProviderTitle />
      <FinalityProviderSubtitle />
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <FinalityProviderSearch />
        </div>
        <div className="w-full md:w-[200px]">
          <FinalityProviderFilter />
        </div>
      </div>
      <FinalityProviderTable />
    </div>
  );
};
