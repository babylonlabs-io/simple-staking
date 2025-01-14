import { Page } from "@playwright/test";

// Sample wallet implementation for E2E testing purposes
export const injectBTCWallet = async (page: Page) => {
  // Inject the wallet methods into window.btcwallet
  await page.evaluate(() => {
    // wallet
    const btcWallet = {
      connectWallet: () => {
        return btcWallet;
      },
      getWalletProviderName: () => "BTC Wallet",
      getAddress: () =>
        "bc1p8gjpy0vyfdq3tty8sy0v86dvl69rquc85n2gpuztll9wxh9cpars7r97sd",
      getPublicKeyHex: () =>
        "024c6e2954c75bcb53aa13b7cd5d8bcdb4c9a4dd0784d68b115bd4408813b45608",
      on: () => {},
      getNetwork: () => "mainnet",
      getBTCTipHeight: () => 859568,
      getNetworkFees: () => ({
        fastestFee: 1,
        halfHourFee: 1,
        hourFee: 1,
        economyFee: 1,
        minimumFee: 1,
      }),
      getInscriptions: () => [],
      signPsbt: (_psbtHex: string) => {
        return "70736274ff0100fd040102000000028a12de07985b7d06d83d9683eb3c0a86284fa3cbb2df998aed61009d700748ba0200000000fdffffff4ca53ae433b535b660a2dca99724199b2219a617508eed2ccf88762683a622430200000000fdffffff0350c3000000000000225120cf7c40c6fb1395430816dbb5e1ba9f172ef25573a3b609efa1723559cd82d5590000000000000000496a4762626234004c6e2954c75bcb53aa13b7cd5d8bcdb4c9a4dd0784d68b115bd4408813b45608094f5861be4128861d69ea4b66a5f974943f100f55400bf26f5cce124b4c9af7009604450000000000002251203a24123d844b4115ac87811ec3e9acfe8a307307a4d480f04bffcae35cb80f47340e0d000001012b50ba0000000000002251203a24123d844b4115ac87811ec3e9acfe8a307307a4d480f04bffcae35cb80f470108420140f94b4114bf4c77c449fefb45d60a86831a73897e58b03ba8250e1bf877912cdcc48d106fa266e8aa4085a43e9ad348652fb7b1ad0d820b6455c06edd92cadfef0001012b79510000000000002251203a24123d844b4115ac87811ec3e9acfe8a307307a4d480f04bffcae35cb80f470108420140e7abc0544c68c94a154e9136397ad8ab7d4dce0545c7c0db89aeb9a455e9377fb1c116ca20cdcb1c1ef4c9335a85c34499f45918ee37b010b69220626c4a8d7100000000";
      },
      pushTx: (_txHex: string) => {
        return "47af61d63bcc6c513561d9a1198d082052cc07a81f50c6f130653f0a6ecc0fc1";
      },
    };

    window.btcwallet = btcWallet;
  });
};
