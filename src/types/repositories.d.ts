namespace Repository {
  interface CRUD<Value, Key> {
    create: (entity: Value) => Promise<Key>;
    read: (id: Key) => Promise<Value | undefined>;
    update: (entity: Value) => Promise<Key>;
    delete: (id: Key) => Promise<void>;
    createMany: (entities: Value[]) => Promise<Key[]>;
    readAll: () => Promise<Value[]>;
    updateMany: (entities: Value[]) => Promise<Key[]>;
    deleteAll: () => Promise<void>;
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  type DelegationRepo = CRUD<{}, "id">;
}

interface Repository {
  delegationRepo: Repository.DelegationRepo;
}
