import { DelegationList } from "@/components/delegations/DelegationList";

import { Delegations } from "./Delegations";

export function Activity() {
  return (
    <section>
      <Delegations />
      <DelegationList />
    </section>
  );
}
