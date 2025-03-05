"use client";

import {
  createContext,
  useContext,
  useState,
  type PropsWithChildren,
} from "react";

interface TermsContextType {
  hasAcceptedTerms: boolean;
  acceptTerms: () => void;
  clearTerms: () => void;
}

const TermsContext = createContext<TermsContextType>({
  hasAcceptedTerms: false,
  acceptTerms: () => {},
  clearTerms: () => {},
});

export const useTermsContext = () => useContext(TermsContext);

export interface LifecycleHooks {
  acceptTermsOfService: () => Promise<void>;
  verifyBTCAddress: (address: string) => Promise<boolean>;
}

interface LifecycleContextType {
  lifecycleHooks: LifecycleHooks;
}

const LifecycleContext = createContext<LifecycleContextType>({
  lifecycleHooks: {
    acceptTermsOfService: async () => {},
    verifyBTCAddress: async () => true,
  },
});

export const useLifecycleContext = () => useContext(LifecycleContext);

export const LifecycleProvider = ({ children }: PropsWithChildren) => {
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);

  const acceptTerms = () => {
    setHasAcceptedTerms(true);
  };

  const clearTerms = () => {
    setHasAcceptedTerms(false);
  };

  const lifecycleHooks: LifecycleHooks = {
    acceptTermsOfService: async () => {
      acceptTerms();
    },
    verifyBTCAddress: async (address: string) => {
      // TODO: implement BTC address verification
      return true;
    },
  };

  return (
    <TermsContext.Provider
      value={{ hasAcceptedTerms, acceptTerms, clearTerms }}
    >
      <LifecycleContext.Provider value={{ lifecycleHooks }}>
        {children}
      </LifecycleContext.Provider>
    </TermsContext.Provider>
  );
};
