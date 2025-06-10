import {
  asClass,
  asFunction,
  asValue,
  createContainer as createAwilixContainer,
  isClass,
  isFunction,
} from "awilix/browser";

const modules: Record<string, any> = import.meta.glob(
  [
    "./{domain/services,application,infrastructure,interfaces}/**/*.ts",
    "!**/*.{type,d}.ts",
  ],
  {
    eager: true,
  },
);
const FILE_NAME_REGEX = /([^\\/]+?)(?:\.[^.]*)?$/;

const getFileName = (path: string) => path.match(FILE_NAME_REGEX)?.[1] ?? "";

const createResolver = (entity: any) => {
  if (isClass(entity)) return asClass(entity);
  if (isFunction(entity)) return asFunction(entity);
  return asValue(entity);
};

const createContainer = (modules: Record<string, any>) => {
  const diContainer = createAwilixContainer<DI.Container>();

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
