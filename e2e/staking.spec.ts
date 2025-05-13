import { expect, test } from "@playwright/test";

import {
  STAKING_AMOUNT_BTC,
  STAKING_AMOUNT_SAT,
  STAKING_TX_HASH,
} from "./constants/staking";
import { WalletConnectActions } from "./fixtures/wallet_connect";

test.describe("Create staking transaction", () => {
  let actions: WalletConnectActions;

  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    actions = new WalletConnectActions(page);
    await actions.setupWalletConnection();
  });

  test("prepare the staking", async ({ page }) => {
    const previewButton = page.locator("button").filter({ hasText: "Preview" });

    // Selects the first finality provider in the list
    await page.locator("#finality-providers>div>div").first().click();
    expect(previewButton).toBeDisabled();

    // Preview available after filling the amount
    await page.getByPlaceholder("BTC").fill(`${STAKING_AMOUNT_BTC}`);
    expect(previewButton).toBeEnabled();

    await previewButton.click();
    const stakeButton = page.locator("button").filter({ hasText: "Stake" });
    await stakeButton.click();

    // Success modal
    const success = page
      .getByTestId("modal")
      .locator("div")
      .filter({ hasText: "Congratulations!" });
    expect(success).toBeVisible();

    // Check for local storage
    const item = await page.evaluate(() =>
      localStorage.getItem(
        "bbn-staking-delegations-4c6e2954c75bcb53aa13b7cd5d8bcdb4c9a4dd0784d68b115bd4408813b45608",
      ),
    );
    expect(item).not.toBeNull();

    const parsed = JSON.parse(item as string);
    expect(parsed).toHaveLength(1);

    // Check the staking delegation tx hash and staking value
    const [delegation] = parsed;
    expect(delegation.stakingValueSat).toBe(STAKING_AMOUNT_SAT);
    expect(delegation.stakingTxHashHex).toBe(STAKING_TX_HASH);
  });
});
