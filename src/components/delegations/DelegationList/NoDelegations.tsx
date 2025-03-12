import { Heading } from "@babylonlabs-io/core-ui";
import { LuPartyPopper } from "react-icons/lu";

import { getNetworkConfigBBN } from "@/config/network/bbn";

const { networkFullName: bbnNetworkFullName } = getNetworkConfigBBN();

export const NoDelegations = () => (
  <div className="flex flex-col pb-8 pt-4 text-accent-primary gap-4 text-center items-center justify-center">
    <div className="bg-primary-contrast h-20 w-20 flex items-center justify-center">
      <LuPartyPopper className="text-5xl text-primary-light" />
    </div>
    <Heading variant="h4">No {bbnNetworkFullName} Stakes</Heading>
    <p className="text-base">
      This is where your transitioned stakes will be displayed.
    </p>
  </div>
);
