import type {
  RegistrationStep,
  SignPsbtOptions,
} from "@babylonlabs-io/btc-staking-ts";
import { EventData } from "@babylonlabs-io/btc-staking-ts";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import { useLocalStorage } from "usehooks-ts";

import { useBTCWallet } from "@/ui/common/context/wallet/BTCWalletProvider";
import { useDelegations } from "@/ui/common/hooks/client/api/useDelegations";
import { useEventBus } from "@/ui/common/hooks/useEventBus";
import type { Delegation } from "@/ui/common/types/delegations";
import { createStateUtils } from "@/ui/common/utils/createStateUtils";
import { calculateDelegationsDiff } from "@/ui/common/utils/local_storage/calculateDelegationsDiff";
import { getDelegationsLocalStorageKey as getDelegationsKey } from "@/ui/common/utils/local_storage/getDelegationsLocalStorageKey";

export type SigningStep =
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
  registrationStep?: SigningStep;
  selectedDelegation?: Delegation;
  // Methods
  addDelegation: (delegation: Delegation) => void;
  fetchMoreDelegations: () => void;
  setRegistrationStep: (step: SigningStep, options?: SignPsbtOptions) => void;
  setProcessing: (value: boolean) => void;
  setSelectedDelegation: (delegation?: Delegation) => void;
  resetRegistration: () => void;
  refetch: () => void;
  delegationStepOptions: EventData | undefined;
  setDelegationStepOptions: (options?: EventData) => void;
}

export const REGISTRATION_STEP_MAP: Record<RegistrationStep, SigningStep> = {
  "staking-slashing": "registration-staking-slashing",
  "unbonding-slashing": "registration-unbonding-slashing",
  "proof-of-possession": "registration-proof-of-possession",
  "create-btc-delegation-msg": "registration-sign-bbn",
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
    delegationStepOptions: undefined,
    setDelegationStepOptions: () => null,
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
  const [registrationStep, setRegistrationStep] = useState<
    SigningStep | undefined
  >();
  const [selectedDelegation, setSelectedDelegation] = useState<Delegation>();
  const [delegationStepOptions, setDelegationStepOptions] =
    useState<EventData>();

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
    setDelegationStepOptions(undefined);
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
    const unsubscribe = eventBus.on("delegation:register", (options) => {
      const type = options?.type as RegistrationStep | undefined;

      if (type) {
        const stepName = REGISTRATION_STEP_MAP[type];
        setRegistrationStep(stepName);
        setDelegationStepOptions(options);
      }
    });

    return unsubscribe;
  }, [setRegistrationStep, setDelegationStepOptions, eventBus]);

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
      delegationStepOptions,
      setDelegationStepOptions,
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
      delegationStepOptions,
      setDelegationStepOptions,
    ],
  );

  return <StateProvider value={state}>{children}</StateProvider>;
}

export { useDelegationState };
