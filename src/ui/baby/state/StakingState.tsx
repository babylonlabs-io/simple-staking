import { type PropsWithChildren, useCallback, useMemo, useState } from "react";

import { useDelegationService } from "@/ui/baby/hooks/services/useDelegationService";
import { useWalletService } from "@/ui/baby/hooks/services/useWalletService";
import { useError } from "@/ui/common/context/Error/ErrorProvider";
import { useLogger } from "@/ui/common/hooks/useLogger";
import { createStateUtils } from "@/ui/common/utils/createStateUtils";

interface FormData {
  validatorAddress: string;
  amount: string;
}

type StakingStep = "form" | "preview" | "loading" | "final";

interface StakingState {
  formSchema: any;
  step: StakingStep;
  balance: number;
  formData: FormData | null;
  showPreview(data: FormData): void;
  submitForm(): Promise<void>;
  resetForm(): void;
  calculateFee: (params: FormData) => Promise<number>;
}

const { StateProvider, useState: useStakingState } =
  createStateUtils<StakingState>({
    formSchema: null,
    step: "form",
    balance: 0,
    formData: null,
    calculateFee: async () => 0,
    showPreview: () => {},
    submitForm: async () => {},
    resetForm: () => {},
  });

function StakingState({ children }: PropsWithChildren) {
  const [step, setStep] = useState<StakingStep>("form");
  const [formData, setFormData] = useState<FormData | null>(null);

  const { stake, estimateStakingFee } = useDelegationService();
  const { balance } = useWalletService();
  const { handleError } = useError();
  const logger = useLogger();

  const formSchema = null;

  const showPreview = useCallback((formData: FormData) => {
    setStep("preview");
    setFormData(formData);
  }, []);

  const submitForm = useCallback(async () => {
    if (!formData) return;

    try {
      setStep("loading");
      const result = await stake(formData);
      logger.info("Baby Staking: Stake", {
        txHash: result?.txHash,
      });
    } catch (error: any) {
      handleError({ error });
      logger.error(error);
    } finally {
      setStep("final");
    }
  }, [formData, logger, stake, handleError]);

  const calculateFee = useCallback(
    async ({ validatorAddress, amount }: FormData) => {
      try {
        return estimateStakingFee({ validatorAddress, amount });
      } catch (error: any) {
        handleError({ error });
        logger.error(error);
        return 0;
      }
    },
    [estimateStakingFee, handleError, logger],
  );

  const resetForm = useCallback(() => {
    setStep("form");
    setFormData(null);
  }, []);

  const context = useMemo(
    () => ({
      step,
      formData,
      balance,
      formSchema,
      calculateFee,
      showPreview,
      submitForm,
      resetForm,
    }),
    [formData, step, balance, resetForm, showPreview, submitForm, calculateFee],
  );

  return <StateProvider value={context}>{children}</StateProvider>;
}

export { StakingState, useStakingState };
