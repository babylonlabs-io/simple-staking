import type { ManagerEvents } from "@babylonlabs-io/btc-staking-ts";
import { createNanoEvents } from "nanoevents";

export type EventBusEvents = ManagerEvents;

const eventBus = createNanoEvents<EventBusEvents>();

export function useEventBus() {
  return eventBus;
}
