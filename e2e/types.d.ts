declare global {
  interface Window {
    // From balanceAddress.spec.ts
    mockCosmJSBankBalance: (
      address: string,
    ) => Promise<{ amount: string; denom: string }>;
    mockCosmJSRewardsQuery: (address: string) => Promise<{
      rewardGauges: {
        [key: string]: {
          coins: Array<{ amount: string; denom: string }>;
          withdrawnCoins: Array<{ amount: string; denom: string }>;
        };
      };
    }>;

    require: any;
    __e2eTestMode: boolean;
    __mockVerifyBTCAddress: () => Promise<boolean>;

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

    unisat?: any;
    $onekey?: any;
  }
}

export {};
