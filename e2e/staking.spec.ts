import { expect, test } from "@playwright/test";

import { setupWalletConnection } from "./helper/connect";

test.describe("Create staking transaction", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await setupWalletConnection(page);
  });

  test("prepare the staking", async ({ page }) => {
    const previewButton = page.locator("button").filter({ hasText: "Preview" });

    // Selects the first finality provider in the list
    await page.locator("#finality-providers>div>div").first().click();
    expect(previewButton).toBeDisabled();

    // Preview available after filling the amount
    await page.getByPlaceholder("BTC").fill("0.0005");
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
    expect(delegation.stakingValueSat).toBe(50000);
    expect(delegation.stakingTxHashHex).toBe(
      "47af61d63bcc6c513561d9a1198d082052cc07a81f50c6f130653f0a6ecc0fc1",
    );
  });
});
