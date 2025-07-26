import { type PropsWithChildren, useCallback, useMemo, useState } from "react";

import { useDelegationService } from "@/ui/baby/hooks/services/useDelegationService";
import { useError } from "@/ui/common/context/Error/ErrorProvider";
import { useLogger } from "@/ui/common/hooks/useLogger";
import { createStateUtils } from "@/ui/common/utils/createStateUtils";

interface UnbondProps {
  validatorAddress: string;
  amount: string;
}

export interface Delegation {
  validatorAddress: string;
  delegatorAddress: string;
  shares: number;
  amount: bigint;
  coin: "ubbn";
}

interface ValidatorState {
  loading: boolean;
  delegations: Delegation[];
  unbond: (params: UnbondProps) => Promise<void>;
}

const { StateProvider, useState: useDelegationState } =
  createStateUtils<ValidatorState>({
    loading: false,
    delegations: [],
    unbond: async () => {},
  });

function DelegationState({ children }: PropsWithChildren) {
  const [processing, setProcessing] = useState(false);

  const { loading, delegations, unstake } = useDelegationService();
  const { handleError } = useError();
  const logger = useLogger();

  const groupedDelegations = useMemo(
    () =>
      Object.values(
        delegations.reduce(
          (acc, item) => {
            const delegation = acc[item.delegation.validatorAddress];

            if (delegation) {
              delegation.shares += parseFloat(item.delegation.shares);
              delegation.amount += BigInt(item.balance.amount);
            } else {
              acc[item.delegation.validatorAddress] = {
                validatorAddress: item.delegation.validatorAddress,
                delegatorAddress: item.delegation.delegatorAddress,
                shares: parseFloat(item.delegation.shares),
                amount: BigInt(item.balance.amount),
                coin: "ubbn",
              };
            }

            return acc;
          },
          {} as Record<string, Delegation>,
        ),
      ),
    [delegations],
  );

  const unbond = useCallback(
    async ({ validatorAddress, amount }: UnbondProps) => {
      try {
        setProcessing(true);
        const result = await unstake({ validatorAddress, amount });
        logger.info("Baby Staking: Unbond", {
          txHash: result?.txHash,
        });
      } catch (error: any) {
        handleError({ error });
        logger.error(error);
      } finally {
        setProcessing(false);
      }
    },
    [handleError, logger, unstake],
  );

  const context = useMemo(
    () => ({
      loading: processing || loading,
      delegations: groupedDelegations,
      unbond,
    }),
    [processing, loading, groupedDelegations, unbond],
  );

  return <StateProvider value={context}>{children}</StateProvider>;
}

export { DelegationState, useDelegationState };
