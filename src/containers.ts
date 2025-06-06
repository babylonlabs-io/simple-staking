import {
  asClass,
  asFunction,
  asValue,
  createContainer as createAwilixContainer,
  isClass,
} from "awilix/browser";

const FILE_NAME_REGEX = /([^\\/]+?)(?:\.[^.]*)?$/;

const modules: Record<string, any> = import.meta.glob(
  [
    "./{domain/services,application,infrastructure,interfaces}/**/*.ts",
    "!**/*.{type,d}.ts",
  ],
  {
    eager: true,
  },
);

const getFileName = (path: string) => path.match(FILE_NAME_REGEX)?.[1] ?? "";

const createResolver = (entity: any) => {
  if (typeof entity === "object") return asValue(entity);
  if (isClass(entity)) return asClass(entity);
  return asFunction(entity);
};

const createContainer = (modules: Record<string, any>) => {
  const diContainer = createAwilixContainer<DI.Dependencies>();

  for (const [path, loadedModule] of Object.entries(modules)) {
    const name = getFileName(path);
    const entity = loadedModule.default;

    if (entity && name) {
      diContainer.register(name, createResolver(entity));
    }
  }

  return diContainer;
};

export default createContainer(modules);
