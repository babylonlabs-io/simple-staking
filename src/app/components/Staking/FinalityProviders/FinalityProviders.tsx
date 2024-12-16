import { Heading, Text } from "@babylonlabs-io/bbn-core-ui";

import { FinalityProviderFilter } from "./FinalityProviderFilter";
import { FinalityProviderSearch } from "./FinalityProviderSearch";
import { FinalityProviderTable } from "./FinalityProviderTable";

export const FinalityProviders = () => {
  return (
    <div className="flex flex-col gap-4">
      <Heading variant="h5" className="text-primary-dark">
        Step 1
      </Heading>
      <Text variant="body1" className="text-primary-dark">
        Select a Finality Provider
      </Text>
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
