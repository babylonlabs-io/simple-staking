declare global {
  interface Window {
    require: any;
    __e2eTestMode: boolean;
    __mockVerifyBTCAddress: () => Promise<boolean>;
  }
}

export {};
