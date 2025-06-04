import {
  SigningStep,
  type SignPsbtOptions,
} from "@babylonlabs-io/btc-staking-ts";
import { createNanoEvents } from "nanoevents";

export interface EventBusEvents {
  // Create new Delegation V2
  "delegation:create": (step: SigningStep, options?: SignPsbtOptions) => void;
  // Register Delegation V1
  "delegation:register": (step: SigningStep, options?: SignPsbtOptions) => void;
  // Delegation v2
  "delegation:stake": (step: SigningStep, options?: SignPsbtOptions) => void;
  "delegation:unbond": (step: SigningStep, options?: SignPsbtOptions) => void;
  "delegation:withdraw": (step: SigningStep, options?: SignPsbtOptions) => void;
}

const eventBus = createNanoEvents<EventBusEvents>();

export function useEventBus() {
  return eventBus;
}
