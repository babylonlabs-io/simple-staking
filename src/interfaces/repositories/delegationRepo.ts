import { createRepository } from "@/shared/utils/repository";

export default ({ db }: DI.Container) => createRepository(db)("delegations");
