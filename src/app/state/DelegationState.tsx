import {
  SigningStep,
  type SignPsbtOptions,
} from "@babylonlabs-io/btc-staking-ts";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import { useLocalStorage } from "usehooks-ts";

import { useBTCWallet } from "@/app/context/wallet/BTCWalletProvider";
import { useDelegations } from "@/app/hooks/client/api/useDelegations";
import { useEventBus } from "@/app/hooks/useEventBus";
import type { Delegation } from "@/app/types/delegations";
import { createStateUtils } from "@/app/utils/createStateUtils";
import { calculateDelegationsDiff } from "@/app/utils/local_storage/calculateDelegationsDiff";
import { getDelegationsLocalStorageKey as getDelegationsKey } from "@/app/utils/local_storage/getDelegationsLocalStorageKey";

type RegistrationSigningStep = Extract<
  SigningStep,
  | "staking-slashing"
  | "unbonding-slashing"
  | "proof-of-possession"
  | "create-btc-delegation-msg"
>;

export type RegistrationStep =
  | undefined
  | "registration-start"
  | "registration-staking-slashing"
  | "registration-unbonding-slashing"
  | "registration-proof-of-possession"
  | "registration-sign-bbn"
  | "registration-send-bbn"
  | "registration-verifying"
  | "registration-verified";

interface DelegationState {
  isLoading: boolean;
  hasMoreDelegations: boolean;
  delegations: Delegation[];
  // Registration state
  processing: boolean;
  registrationStep: RegistrationStep;
  selectedDelegation?: Delegation;
  // Methods
  addDelegation: (delegation: Delegation) => void;
  fetchMoreDelegations: () => void;
  setRegistrationStep: (
    step: RegistrationStep,
    options?: SignPsbtOptions,
  ) => void;
  setProcessing: (value: boolean) => void;
  setSelectedDelegation: (delegation?: Delegation) => void;
  resetRegistration: () => void;
  refetch: () => void;
}

const REGISTRATION_STEP_MAP: Record<RegistrationSigningStep, RegistrationStep> =
  {
    [SigningStep.STAKING_SLASHING]: "registration-staking-slashing",
    [SigningStep.UNBONDING_SLASHING]: "registration-unbonding-slashing",
    [SigningStep.PROOF_OF_POSSESSION]: "registration-proof-of-possession",
    [SigningStep.CREATE_BTC_DELEGATION_MSG]: "registration-sign-bbn",
  };

const { StateProvider, useState: useDelegationState } =
  createStateUtils<DelegationState>({
    isLoading: false,
    delegations: [],
    hasMoreDelegations: false,
    processing: false,
    registrationStep: undefined,
    selectedDelegation: undefined,
    addDelegation: () => null,
    fetchMoreDelegations: () => null,
    setRegistrationStep: () => null,
    setProcessing: () => null,
    setSelectedDelegation: () => null,
    resetRegistration: () => null,
    refetch: () => null,
  });

export function DelegationState({ children }: PropsWithChildren) {
  const { publicKeyNoCoord } = useBTCWallet();
  const { data, fetchNextPage, isFetchingNextPage, hasNextPage, refetch } =
    useDelegations();
  const eventBus = useEventBus();

  // States
  const [delegations, setDelegations] = useLocalStorage<Delegation[]>(
    getDelegationsKey(publicKeyNoCoord),
    [],
  );
  const [processing, setProcessing] = useState(false);
  const [registrationStep, setRegistrationStep] = useState<RegistrationStep>();
  const [selectedDelegation, setSelectedDelegation] = useState<Delegation>();
  const [currentDelegationStepOptions, setCurrentDelegationStepOptions] =
    useState<SignPsbtOptions>();

  // Methods
  const addDelegation = useCallback(
    (newDelegation: Delegation) => {
      setDelegations((delegations) => {
        const exists = delegations.some(
          (delegation) =>
            delegation.stakingTxHashHex === newDelegation.stakingTxHashHex,
        );

        if (!exists) {
          return [newDelegation, ...delegations];
        }

        return delegations;
      });
    },
    [setDelegations],
  );

  const resetRegistration = useCallback(() => {
    setSelectedDelegation(undefined);
    setRegistrationStep(undefined);
    setCurrentDelegationStepOptions(undefined);
    setProcessing(false);
  }, []);

  // Sync delegations with API
  useEffect(
    function syncDelegations() {
      if (!data?.delegations) return;

      const updateDelegations = async () => {
        const { areDelegationsDifferent, delegations: newDelegations } =
          await calculateDelegationsDiff(data.delegations, delegations);
        if (areDelegationsDifferent) {
          setDelegations(newDelegations);
        }
      };

      updateDelegations();
    },
    [data?.delegations, setDelegations, delegations],
  );

  useEffect(() => {
    const unsubscribe = eventBus.on("delegation:register", (step, options) => {
      const stepName = REGISTRATION_STEP_MAP[step as RegistrationSigningStep];

      if (stepName) {
        setRegistrationStep(stepName);
        setCurrentDelegationStepOptions(options);
      }
    });

    return unsubscribe;
  }, [setRegistrationStep, setCurrentDelegationStepOptions, eventBus]);

  // Context
  const state = useMemo(
    () => ({
      delegations,
      isLoading: isFetchingNextPage,
      hasMoreDelegations: hasNextPage,
      processing,
      registrationStep,
      selectedDelegation,
      addDelegation,
      fetchMoreDelegations: fetchNextPage,
      setRegistrationStep,
      setProcessing,
      setSelectedDelegation,
      resetRegistration,
      refetch,
      currentDelegationStepOptions,
    }),
    [
      delegations,
      isFetchingNextPage,
      hasNextPage,
      processing,
      registrationStep,
      selectedDelegation,
      addDelegation,
      fetchNextPage,
      setRegistrationStep,
      setProcessing,
      setSelectedDelegation,
      resetRegistration,
      refetch,
      currentDelegationStepOptions,
    ],
  );

  return <StateProvider value={state}>{children}</StateProvider>;
}

export { useDelegationState };
