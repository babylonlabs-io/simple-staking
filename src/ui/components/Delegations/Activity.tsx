import { AuthGuard } from "@/ui/components/Common/AuthGuard";
import { DelegationList } from "@/ui/components/Delegations/DelegationList";
import { Section } from "@/ui/components/Section/Section";

import { Delegations } from "./Delegations";

export function Activity() {
  return (
    <AuthGuard>
      <Section title="Activity">
        <Delegations />
        <DelegationList />
      </Section>
    </AuthGuard>
  );
}
