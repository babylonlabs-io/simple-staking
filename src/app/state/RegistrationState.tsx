import { useCallback, useMemo, useState, type PropsWithChildren } from "react";

import { createStateUtils } from "@/utils/createStateUtils";

import { BtcStakingInputs } from "../hooks/services/useTransactionService";

export type RegistrationStep =
  | "start"
  | "staking-slashing"
  | "unbonding-slashing"
  | "proof-of-possession"
  | "sign-bbn"
  | "send-bbn"
  | "complete";

export interface RegistrationFormFields {
  stakingTxHex: string;
  startHeight: number;
  stakingInput: BtcStakingInputs;
}

export interface RegistrationState {
  processing: boolean;
  step?: RegistrationStep;
  formData?: RegistrationFormFields;
  setStep: (step: RegistrationStep) => void;
  setProcessing: (value: boolean) => void;
  setFormData: (formData?: RegistrationFormFields) => void;
  reset: () => void;
}

const { StateProvider, useState: useRegistrationState } =
  createStateUtils<RegistrationState>({
    processing: false,
    step: undefined,
    formData: undefined,
    setStep: () => {},
    setProcessing: () => {},
    setFormData: () => {},
    reset: () => {},
  });

export function RegistrationState({ children }: PropsWithChildren) {
  const [currentStep, setCurrentStep] = useState<
    RegistrationStep | undefined
  >();
  const [formData, setFormData] = useState<RegistrationFormFields>();
  const [processing, setProcessing] = useState(false);

  const reset = useCallback(() => {
    setFormData(undefined);
    setCurrentStep(undefined);
    setProcessing(false);
  }, []);

  const context = useMemo(
    () => ({
      processing,
      step: currentStep,
      formData,
      setStep: setCurrentStep,
      setProcessing,
      setFormData,
      reset,
    }),
    [
      processing,
      currentStep,
      formData,
      setCurrentStep,
      setProcessing,
      setFormData,
      reset,
    ],
  );

  return <StateProvider value={context}>{children}</StateProvider>;
}

export { useRegistrationState };
