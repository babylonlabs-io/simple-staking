import {
  Heading,
  HiddenField,
  Text,
  useFormContext,
  useWatch,
} from "@babylonlabs-io/core-ui";

import { FinalityProviderFilter } from "./FinalityProviderFilter";
import { FinalityProviderSearch } from "./FinalityProviderSearch";
import { FinalityProviderTable } from "./FinalityProviderTable";

export const FinalityProviders = () => {
  const { setValue } = useFormContext();
  const selectedFP = useWatch({ name: "finalityProvider", defaultValue: "" });

  return (
    <div className="flex flex-col gap-4">
      <Heading variant="h5" className="text-accent-primary">
        Step 1
      </Heading>
      <Text variant="body1" className="text-accent-secondary">
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

      <FinalityProviderTable
        selectedFP={selectedFP}
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
