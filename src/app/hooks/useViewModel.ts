import { useMemo } from "react";

import diContainer from "@/containers";

export function useViewModel<N extends keyof ViewModel>(name: N): ViewModel[N] {
  return useMemo(() => diContainer.resolve(name), [name]);
}
