/* eslint-disable @typescript-eslint/no-empty-object-type */
import type {
  IDBPObjectStore,
  IDBPTransaction,
  StoreKey,
  StoreNames,
  StoreValue,
} from "idb";

export const createRepository =
  (db: Infra.DB) =>
  <Name extends StoreNames<Infra.Schema>, E extends object = {}>(
    storageName: Name,
    extend?: (
      store: IDBPObjectStore<Infra.Schema, [Name], Name, "readwrite">,
      tx: IDBPTransaction<Infra.Schema, [Name], "readwrite">,
    ) => E,
  ): Repository.CRUD<
    StoreValue<Infra.Schema, Name>,
    StoreKey<Infra.Schema, Name>
  > &
    E => {
    const tx = db.transaction(storageName, "readwrite");
    const store = tx.objectStore(storageName);

    return {
      create: (entity) => store.add(entity),
      read: (id) => store.get(id),
      update: (entity) => store.put(entity),
      delete: (id) => store.delete(id),
      createMany: (entities) =>
        Promise.all(entities.map((entity) => store.add(entity))),
      readAll: () => store.getAll(),
      updateMany: (entities) =>
        Promise.all(entities.map((entity) => store.put(entity))),
      deleteAll: () => store.clear(),
      ...(extend?.(store, tx) ?? ({} as E)),
    };
  };
