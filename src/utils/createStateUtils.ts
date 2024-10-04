import { createContext, useContext } from "react";

export function createStateUtils<S>(defaultState: S) {
  const stateContext = createContext(defaultState);

  return {
    StateProvider: stateContext.Provider,
    useState: () => {
      return useContext(stateContext);
    },
  };
}
