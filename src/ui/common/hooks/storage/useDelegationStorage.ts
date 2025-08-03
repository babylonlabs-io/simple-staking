import { useCallback, useEffect, useMemo } from "react";
import { useLocalStorage } from "usehooks-ts";

import {
  DELEGATION_STATUSES,
  DelegationLike,
  DelegationV2,
  DelegationV2StakingState as State,
} from "@/ui/common/types/delegationsV2";

export function useDelegationStorage(
  key: string,
  delegations?: DelegationV2[],
) {
  const [pendingDelegations = {}, setPendingDelegations] = useLocalStorage<
    Record<string, DelegationLike>
  >(`${key}_pending`, {});
  const [delegationStatuses = {}, setDelegationStatuses] = useLocalStorage<
    Record<string, State>
  >(`${key}_statuses`, {});

  const delegationMap = useMemo(() => {
    return (delegations ?? []).reduce(
      (acc, delegation) => ({
        ...acc,
        [delegation.stakingTxHashHex]: delegation,
      }),
      {} as Record<string, DelegationV2>,
    );
  }, [delegations]);

  const formattedDelegations = useMemo(() => {
    const pendingDelegationArr = Object.values(pendingDelegations).map(
      (d) =>
        ({
          ...d,
          stakingTxHex: "",
          paramsVersion: 0,
          finalityProviderBtcPksHex: [],
          stakerBtcPkHex: "",
          stakingTimelock: 0,
          endHeight: 0,
          unbondingTimelock: 0,
          unbondingTxHex: "",
          stakingSlashingTxHex: "",
          bbnInceptionHeight: 0,
          bbnInceptionTime: new Date().toISOString(),
          canExpand: false,
          slashing: {
            stakingSlashingTxHex: "",
            unbondingSlashingTxHex: "",
            spendingHeight: 0,
          },
        }) as DelegationV2,
    );

    return pendingDelegationArr.concat(
      (delegations ?? [])
        .filter((d) => !pendingDelegations[d.stakingTxHashHex])
        .map((d) => ({
          ...d,
          state: delegationStatuses[d.stakingTxHashHex] ?? d.state,
        })),
    );
  }, [delegations, pendingDelegations, delegationStatuses]);

  useEffect(
    function syncPendingDelegations() {
      if (!key) return;

      setPendingDelegations((delegations) =>
        Object.values(delegations)
          .filter((d) => !delegationMap[d.stakingTxHashHex])
          .reduce(
            (acc, d) => ({ ...acc, [d.stakingTxHashHex]: d }),
            {} as Record<string, DelegationLike>,
          ),
      );
    },
    [key, delegationMap, setPendingDelegations],
  );

  useEffect(
    function syncDelegationStatuses() {
      if (!key) return;

      setDelegationStatuses((statuses) =>
        Object.entries(statuses)
          .filter(([hash, status]) => {
            if (!delegationMap[hash]?.state) return true;

            return (
              DELEGATION_STATUSES[delegationMap[hash].state] <
              DELEGATION_STATUSES[status]
            );
          })
          .reduce(
            (acc, [hash, status]) => ({ ...acc, [hash]: status }),
            {} as Record<string, State>,
          ),
      );
    },
    [key, delegationMap, setDelegationStatuses],
  );

  const addPendingDelegation = useCallback(
    (delegation: DelegationLike) => {
      if (!key) return;

      setPendingDelegations((delegations) => ({
        ...delegations,
        [delegation.stakingTxHashHex]: {
          ...delegation,
          state: State.INTERMEDIATE_PENDING_VERIFICATION,
        },
      }));
    },
    [key, setPendingDelegations],
  );

  const updateDelegationStatus = useCallback(
    (id: string, status: State) => {
      if (!key) return;

      setDelegationStatuses((statuses) => ({ ...statuses, [id]: status }));
    },
    [key, setDelegationStatuses],
  );

  return {
    delegations: formattedDelegations,
    addPendingDelegation,
    updateDelegationStatus,
  };
}
