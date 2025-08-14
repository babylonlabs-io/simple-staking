import { ActivityList } from "@/ui/common/components/Activity/components/ActivityList";
import { AuthGuard } from "@/ui/common/components/Common/AuthGuard";
import { Section } from "@/ui/common/components/Section/Section";

import { Delegations } from "../Delegations/Delegations";

export function Activity() {
  return (
    <AuthGuard>
      <Section>
        <Delegations />
        <ActivityList />
      </Section>
    </AuthGuard>
  );
}
