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
interface Step<K extends string, D = never> {
  name: K;
  data?: D;
}

export type UnbondingStep = Step<"initial"> | Step<"signing"> | Step<"loading">;

interface ValidatorState {
  loading: boolean;
  delegations: Delegation[];
  unbond: (params: UnbondProps) => Promise<void>;
  step: UnbondingStep;
}

const { StateProvider, useState: useDelegationState } =
  createStateUtils<ValidatorState>({
    loading: false,
    delegations: [],
    unbond: async () => {},
    step: { name: "initial" },
  });

function DelegationState({ children }: PropsWithChildren) {
  const { loading, delegations, unstake, sendTx } = useDelegationService();
  const { handleError } = useError();
  const logger = useLogger();

  const [step, setStep] = useState<UnbondingStep>({ name: "initial" });

  const unbond = useCallback(
    async ({ validatorAddress, amount }: UnbondProps) => {
      try {
        setStep({ name: "signing" });
        const { signedTx } = await unstake({
          validatorAddress,
          amount,
        });
        setStep({ name: "loading" });
        const result = await sendTx(
          signedTx,
          "unstake",
          validatorAddress,
          BigInt(amount),
        );
        logger.info("Baby Staking: Unbond", {
          txHash: result?.txHash || "",
          validatorAddress,
          amount,
        });
      } catch (error: any) {
        handleError({ error });
        logger.error(error);
      } finally {
        setStep({ name: "initial" });
      }
    },
    [handleError, logger, sendTx, unstake, setStep],
  );

  const context = useMemo(
    () => ({
      loading,
      delegations,
      unbond,
      step,
    }),
    [loading, delegations, unbond, step],
  );

  return <StateProvider value={context}>{children}</StateProvider>;
}

export { Delegation, DelegationState, useDelegationState };
