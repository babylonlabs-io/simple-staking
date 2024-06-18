import React, { ReactNode, createContext, useContext, useState } from "react";

interface TermsContextProps {
  isTermsOpen: boolean;
  openTerms: () => void;
  closeTerms: () => void;
}

const TermsContext = createContext<TermsContextProps | undefined>(undefined);

export const TermsProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isTermsOpen, setIsTermsOpen] = useState(false);

  const openTerms = () => setIsTermsOpen(true);
  const closeTerms = () => setIsTermsOpen(false);

  return (
    <TermsContext.Provider value={{ isTermsOpen, openTerms, closeTerms }}>
      {children}
    </TermsContext.Provider>
  );
};

export const useTerms = (): TermsContextProps => {
  const context = useContext(TermsContext);
  if (!context) {
    throw new Error("useTerms must be used within a TermsModal");
  }
  return context;
};
