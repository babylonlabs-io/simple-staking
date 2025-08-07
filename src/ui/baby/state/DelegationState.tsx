import { type PropsWithChildren, useCallback, useMemo, useState } from "react";

import {
  type Delegation,
  useDelegationService,
} from "@/ui/baby/hooks/services/useDelegationService";
import { useError } from "@/ui/common/context/Error/ErrorProvider";
import { useLogger } from "@/ui/common/hooks/useLogger";
import { createStateUtils } from "@/ui/common/utils/createStateUtils";

interface UnbondProps {
  validatorAddress: string;
  amount: string;
}

interface ValidatorState {
  loading: boolean;
  delegations: Delegation[];
  unbond: (params: UnbondProps) => Promise<void>;
  clearPendingUnbonding: (validatorAddress?: string) => void;
}

const { StateProvider, useState: useDelegationState } =
  createStateUtils<ValidatorState>({
    loading: false,
    delegations: [],
    unbond: async () => {},
    clearPendingUnbonding: () => {},
  });

function DelegationState({ children }: PropsWithChildren) {
  const [processing, setProcessing] = useState(false);

  const { loading, delegations, unstake, clearPendingUnbonding } =
    useDelegationService();
  const { handleError } = useError();
  const logger = useLogger();

  const unbond = useCallback(
    async ({ validatorAddress, amount }: UnbondProps) => {
      try {
        setProcessing(true);

        const result = await unstake({ validatorAddress, amount });

        logger.info("Baby Staking: Unbond", {
          txHash: result?.txHash,
          validatorAddress,
          amount,
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
      delegations,
      unbond,
      clearPendingUnbonding,
    }),
    [processing, loading, delegations, unbond, clearPendingUnbonding],
  );

  return <StateProvider value={context}>{children}</StateProvider>;
}

export { Delegation, DelegationState, useDelegationState };
