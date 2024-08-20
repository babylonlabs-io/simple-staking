import React, { ReactNode, createContext, useContext, useState } from "react";

interface PrivacyContextProps {
  isPrivacyOpen: boolean;
  openPrivacy: () => void;
  closePrivacy: () => void;
}

const PrivacyContext = createContext<PrivacyContextProps | undefined>(
  undefined,
);

export const PrivacyProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);

  const openPrivacy = () => setIsPrivacyOpen(true);
  const closePrivacy = () => setIsPrivacyOpen(false);

  return (
    <PrivacyContext.Provider
      value={{
        isPrivacyOpen,
        openPrivacy,
        closePrivacy,
      }}
    >
      {children}
    </PrivacyContext.Provider>
  );
};

export const usePrivacy = (): PrivacyContextProps => {
  const context = useContext(PrivacyContext);
  if (!context) {
    throw new Error("usePrivacy must be used within a PrivacyModal");
  }
  return context;
};
