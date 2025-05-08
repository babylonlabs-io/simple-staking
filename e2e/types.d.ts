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

    // From handlers.ts
    require: any;
    __e2eTestMode: boolean;
    __mockVerifyBTCAddress: () => Promise<boolean>;
  }
}

export {};
