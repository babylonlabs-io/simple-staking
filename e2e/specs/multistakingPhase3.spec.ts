import { expect, test } from "@playwright/test";

import { PageNavigationActions, WalletConnectActions } from "../fixtures";

import {
  STAKING_AMOUNT_BTC,
  STAKING_AMOUNT_SAT,
  STAKING_TX_HASH,
} from "../constants/staking";

test.describe("Phase 3 – Multistaking flow", () => {
  let connectActions: WalletConnectActions;
  let navigationActions: PageNavigationActions;

  test.beforeEach(async ({ page }) => {
    navigationActions = new PageNavigationActions(page);
    connectActions = new WalletConnectActions(page);

    await navigationActions.navigateToHomePage(page);
    await connectActions.setupWalletConnection();
  });

  test("user can stake via Multistaking form", async ({ page }) => {
    // Open the BSN / Finality Provider selector
    const addProviderButton = page.locator("div.cursor-pointer").first();
    await addProviderButton.click();

    // Select the first chain in the chain selection modal and proceed
    await page
      .locator("text=Select Babylon Secured Network")
      .waitFor({ state: "visible" });

    // Choose the first enabled network (Babylon Genesis)
    await page.getByRole("button", { name: /Babylon Genesis/i }).click();

    await page.getByRole("button", { name: "Next" }).click();

    // Select the first Finality Provider in the list and add it
    await page
      .locator("text=Select Babylon Genesis Finality Provider")
      .waitFor({ state: "visible" });

    const firstProviderRow = page.locator("table tbody tr").first();
    await firstProviderRow.click();

    await page.getByRole("button", { name: "Add" }).click();

    // After clicking 'Add' button and before filling amount
    await page.evaluate(() => {
      const fpPk =
        "e8a3ef3ca40ade56bd986663f24d5ab3bcc3cd18a88a10a8cd25d8af42314f62";
      const input = document.querySelector(
        'input[name="finalityProvider"]',
      ) as HTMLInputElement | null;
      if (input) {
        input.value = fpPk;
        const ev = new Event("input", { bubbles: true });
        input.dispatchEvent(ev);
        const ev2 = new Event("change", { bubbles: true });
        input.dispatchEvent(ev2);
      }
    });

    // Fill the staking amount
    await page.getByPlaceholder("Enter Amount").fill(`${STAKING_AMOUNT_BTC}`);

    // Preview & proceed
    const previewButton = page.getByRole("button", { name: "Preview" });
    await expect(previewButton).toBeEnabled();
    await previewButton.click();

    // Stake (after verification step)
    const stakeButton = page.getByRole("button", { name: /Stake/ });
    await stakeButton.click();

    // Success modal should be visible
    const successModal = page
      .getByTestId("modal")
      .locator("div")
      .filter({ hasText: "Congratulations" });
    await expect(successModal).toBeVisible();

    // Validate local storage entry
    const [delegationsKey, delegationsItem] = await page.evaluate(() => {
      const key = Object.keys(localStorage).find((k) =>
        k.startsWith("bbn-staking-delegations"),
      );
      return [key, key ? localStorage.getItem(key) : null];
    });

    expect(delegationsKey).not.toBeNull();
    expect(delegationsItem).not.toBeNull();

    const delegations = JSON.parse(delegationsItem as string);
    const firstDelegation = Array.isArray(delegations)
      ? delegations[0]
      : Object.values(delegations)[0];

    expect(
      firstDelegation.stakingAmount ?? firstDelegation.stakingAmountSat,
    ).toBe(STAKING_AMOUNT_SAT);
    expect(firstDelegation.stakingTxHashHex).toBe(STAKING_TX_HASH);
  });
});
