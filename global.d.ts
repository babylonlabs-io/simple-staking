declare global {
  interface Array<T> {
    toSorted(compareFn?: (a: T, b: T) => number): T[];
  }

  interface Window {
    btcwallet: {
      connectWallet: () => any;
      getWalletProviderName: () => string;
      getAddress: () => string;
      getPublicKeyHex: () => string;
      on: (...args: any[]) => any;
      off?: (event: string, callback: Function) => void;
      getNetwork: () => string;
      getBTCTipHeight: () => number;
      getNetworkFees: () => {
        fastestFee: number;
        halfHourFee: number;
        hourFee: number;
        economyFee: number;
        minimumFee: number;
      };
      getInscriptions: () => any[];
      signPsbt: (psbtHex: string) => string;
      pushTx: (txHex: string) => string;
      isConnected?: boolean;
    };

    bbnwallet: {
      connectWallet: () => any;
      getWalletProviderName: () => string;
      getOfflineSigner: () => any;
    };

    okxwallet?: {
      bitcoin: {
        connectWallet: () => any;
        getWalletProviderName: () => string;
        getAddress: () => string;
        getPublicKeyHex: () => string;
        getPublicKey: () => string;
        getNetwork: () => string;
        getBTCTipHeight: () => number;
        getNetworkFees: () => any;
        getInscriptions: () => any[];
        signPsbt: (psbtHex: string) => string;
        pushTx: (txHex: string) => string;
        isOKXWallet: boolean;
        getBalance: () => {
          confirmed: number;
          unconfirmed: number;
          total: number;
        };
        getAccounts: () => string[];
        isAccountActive: () => boolean;
        switchNetwork: (network: string) => Promise<boolean>;
        on: (...args: any[]) => any;
      };
      enable: (chain?: string) => Promise<string[]>;
      request: (params: { method: string; params?: any }) => Promise<any>;
      isConnected: () => boolean;
      supportedChains: string[];
      hasChain: (chain: string) => boolean;
      on: (event: string, handler: Function) => void;
      off: (event: string, handler: Function) => void;
      isOKXWallet: boolean;
      version: string;
    };

    unisat?: any;
    $onekey?: any;
    tomo_btc?: any;
  }
}

export {};
