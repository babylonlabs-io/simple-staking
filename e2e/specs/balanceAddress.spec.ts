import { expect, test } from "@playwright/test";

import {
  PageNavigationActions,
  WalletBalanceActions,
  WalletConnectActions,
} from "../fixtures";

test.describe("Balance and address checks after connection", () => {
  let connectActions: WalletConnectActions;
  let balanceActions: WalletBalanceActions;
  let navigationActions: PageNavigationActions;

  test.beforeEach(async ({ page }) => {
    connectActions = new WalletConnectActions(page);
    balanceActions = new WalletBalanceActions(page);
    navigationActions = new PageNavigationActions(page);

    await navigationActions.navigateToHomePage(page);
    await connectActions.setupWalletConnection();
  });

  test.skip("balance is correct", async () => {
    await balanceActions.waitForBalanceLoadingComplete();

    const stakedBalanceText = await balanceActions.getStakedBalance();
    const stakableBalance = await balanceActions.getStakableBalance();
    const babyBalance = await balanceActions.getBabyBalance();
    const babyRewards = await balanceActions.getBabyRewards();

    expect(stakedBalanceText).toContain("0.09876543 BTC");
    expect(stakableBalance).toContain("0.00074175 BTC");
    expect(babyBalance).toContain("1 BABY");
    expect(babyRewards).toContain("0.5 BABY");
  });
});
