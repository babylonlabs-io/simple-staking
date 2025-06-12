/* eslint-disable @typescript-eslint/no-empty-object-type */
import type { DBSchema, IDBPDatabase } from "idb";

declare global {
  namespace Infra {
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

    type DB = IDBPDatabase<Schema>;
  }

  interface Infra {
    db: Infra.DB;
  }
}
