/* eslint-disable @typescript-eslint/no-empty-object-type */
import {
  SigningStep,
  type SignPsbtOptions,
} from "@babylonlabs-io/btc-staking-ts";
import type { DBSchema, IDBPDatabase } from "idb";
import type { Emitter } from "nanoevents";

import type { Api } from "@/shared/utils/swagger/api";

type Context = Record<string, number | string | boolean> & {
  category?: string;
};

type ErrorContext = {
  level?: SeverityLevel;
  tags?: Record<string, string>;
  data?: Record<string, string | number | boolean>;
};

declare global {
  namespace Infra {
    type DB = {};

    interface EventBusEvents {
      // Create new Delegation V2
      "delegation:create": (
        step: SigningStep,
        options?: SignPsbtOptions,
      ) => void;
      // Register Delegation V1
      "delegation:register": (
        step: SigningStep,
        options?: SignPsbtOptions,
      ) => void;
      // Delegation v2
      "delegation:stake": (
        step: SigningStep,
        options?: SignPsbtOptions,
      ) => void;
      "delegation:unbond": (
        step: SigningStep,
        options?: SignPsbtOptions,
      ) => void;
      "delegation:withdraw": (
        step: SigningStep,
        options?: SignPsbtOptions,
      ) => void;
    }

    type EventBus = Emitter<EventBusEvents>;

    interface Logger {
      info(message: string, context?: Context): void;
      warn(message: string, context?: Context): void;
      error(error: Error, context?: ErrorContext): string;
    }

    interface Schema extends DBSchema {
      delegations: {
        key: "id";
        value: {};
      };
      finalityProviders: {
        key: "id";
        value: {};
      };
    }

    type API = Api;

    type DB = IDBPDatabase<StakingSchema>;
  }

  interface Infra {
    db: Infra.DB;
    eventBus: Infra.EventBus;
    logger: Infra.Logger;
    api: Infra.API;
  }
}
