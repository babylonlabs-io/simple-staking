import { RouteGuard } from "@/ui/common/components/RouteGuard/RouteGuard";
import { Section } from "@/ui/common/components/Section/Section";

import { BabyActivityList } from "../../components/ActivityList";

export default function Activities() {
  return (
    <RouteGuard redirectTo="/baby/staking">
      <Section title="Activity" titleClassName="md:text-[1.25rem]">
        <BabyActivityList />
      </Section>
    </RouteGuard>
  );
}
