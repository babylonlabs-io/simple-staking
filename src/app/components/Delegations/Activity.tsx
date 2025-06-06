import { AuthGuard } from "@/app/components/Common/AuthGuard";
import { DelegationList } from "@/app/components/Delegations/DelegationList";
import { Section } from "@/app/components/Section/Section";

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
