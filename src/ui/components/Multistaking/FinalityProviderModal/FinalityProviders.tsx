import { HiddenField, useFormContext } from "@babylonlabs-io/core-ui";

import { FinalityProviderFilter } from "@/ui/components/Staking/FinalityProviders/FinalityProviderFilter";
import { FinalityProviderSearch } from "@/ui/components/Staking/FinalityProviders/FinalityProviderSearch";
import { FinalityProviderTable } from "@/ui/components/Staking/FinalityProviders/FinalityProviderTable";

export const FinalityProviders = () => {
  const { setValue } = useFormContext();

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

      <FinalityProviderTable
        onSelectRow={(pk) =>
          setValue("finalityProvider", pk, {
            shouldValidate: true,
            shouldTouch: true,
            shouldDirty: true,
          })
        }
      />

      <HiddenField name="finalityProvider" defaultValue="" />
    </div>
  );
};
