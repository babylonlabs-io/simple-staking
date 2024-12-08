import { Input } from "@babylonlabs-io/bbn-core-ui";
import { RiSearchLine } from "react-icons/ri";

export const FinalityProviderSearch = () => {
  return (
    <Input
      placeholder="Search finality providers..."
      decorators={{
        suffix: <RiSearchLine size={20} />,
      }}
    />
  );
};
