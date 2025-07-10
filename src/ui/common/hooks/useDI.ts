import { useMemo } from "react";

import diContainer from "@/containers";

export function useDI<N extends keyof DI.Container>(name: N): DI.Container[N] {
  return useMemo(() => diContainer.resolve(name), [name]);
}
