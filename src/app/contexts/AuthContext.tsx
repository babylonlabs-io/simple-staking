"use client";

import { useWalletConnect } from "@babylonlabs-io/wallet-connector";
import {
  GoogleAuthProvider,
  User,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { createContext, useContext, useEffect, useState } from "react";

import { auth } from "@/config/firebase";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isLoggedIn: boolean;
  isWalletConnected: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const { disconnect } = useWalletConnect();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setIsLoggedIn(Boolean(user));
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error signing in with Google:", error);
    }
  };

  const handleConnectWallet = async () => {
    try {
      setIsWalletConnected(true);
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  };

  const handleDisconnectWallet = async () => {
    try {
      await disconnect();
      setIsWalletConnected(false);
    } catch (error) {
      console.error("Error disconnecting wallet:", error);
    }
  };

  const handleLogout = async () => {
    try {
      // 지갑 연결 해제
      if (isWalletConnected) {
        await handleDisconnectWallet();
      }
      // 구글 로그아웃
      await signOut(auth);
      setIsLoggedIn(false);
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isLoggedIn,
        isWalletConnected,
        signInWithGoogle,
        logout: handleLogout,
        connectWallet: handleConnectWallet,
        disconnectWallet: handleDisconnectWallet,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
