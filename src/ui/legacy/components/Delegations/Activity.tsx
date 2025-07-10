import { AuthGuard } from "@/ui/legacy/components/Common/AuthGuard";
import { DelegationList } from "@/ui/legacy/components/Delegations/DelegationList";
import { Section } from "@/ui/legacy/components/Section/Section";

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
