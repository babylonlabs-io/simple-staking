import { AuthGuard } from "@/ui/common/components/Common/AuthGuard";
import { DelegationList } from "@/ui/common/components/Delegations/DelegationList";
import { Section } from "@/ui/common/components/Section/Section";

import { Delegations } from "./Delegations";

export function Activity() {
  return (
    <AuthGuard>
      <Section title="Activity" titleClassName="md:text-[1.25rem] mt-10">
        <Delegations />
        <DelegationList />
      </Section>
    </AuthGuard>
  );
}
