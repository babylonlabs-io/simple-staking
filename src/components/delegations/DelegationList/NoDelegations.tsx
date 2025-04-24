import { getNetworkConfigBBN } from "@/config/network/bbn";
import { EmptyPrompt, PromptBox } from "@/ui";

const { networkFullName: bbnNetworkFullName } = getNetworkConfigBBN();

export const NoDelegations = () => (
  <PromptBox className="py-[10vh]">
    <EmptyPrompt
      title={`No ${bbnNetworkFullName} Stakes`}
      subtitle="This is where your registered stakes will be displayed."
      // cta={<StakeButton application size="md" color="inverse" />}
    />
  </PromptBox>
);
