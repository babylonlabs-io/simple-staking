import { expect, test } from "@playwright/test";

import { DelegationState } from "@/app/types/delegations";
import { getState } from "@/utils/getState";

import { PageNavigationActions, WalletConnectActions } from "../fixtures";
import { activeTX, unbondingTX } from "../mock/tx/unbonding";
import { setDelegationsResponse } from "../mocks/handlers";

test.describe("Create unbonding transaction", () => {
  let connectActions: WalletConnectActions;
  let navigationActions: PageNavigationActions;

  test.beforeEach(async ({ page }) => {
    connectActions = new WalletConnectActions(page);
    navigationActions = new PageNavigationActions(page);
  });

  test("prepare the unbonding", async ({ page }) => {
    // Configure mock responses
    setDelegationsResponse(activeTX);

    await navigationActions.navigateToHomePage(page);
    await connectActions.setupWalletConnection();

    // unbond -> proceed
    await page.getByRole("button", { name: "Unbond" }).click();
    await page.getByRole("button", { name: "Proceed" }).click();

    // expect the unbonding state text instead of a button
    await expect(
      page.getByText(getState(DelegationState.INTERMEDIATE_UNBONDING)),
    ).toBeVisible();
  });

  test("unbonding requested", async ({ page }) => {
    // Modify the activeTX to reflect "unbonding requested"
    const updatedTX = {
      ...activeTX,
      data: activeTX.data.map((tx) => ({
        ...tx,
        state: DelegationState.UNBONDING_REQUESTED,
      })),
    };

    // Configure mock responses
    setDelegationsResponse(updatedTX);

    await navigationActions.navigateToHomePage(page);
    await connectActions.setupWalletConnection();

    await expect(page.getByText("Unbonding Requested")).toBeVisible();
  });

  test("unbonded", async ({ page }) => {
    // Modify the activeTX to reflect "unbonded"
    const updatedTX = {
      ...activeTX,
      data: activeTX.data.map((tx) => ({
        ...tx,
        state: DelegationState.UNBONDED,
        unbonding_tx: unbondingTX,
      })),
    };

    // Configure mock responses
    setDelegationsResponse(updatedTX);

    await navigationActions.navigateToHomePage(page);
    await connectActions.setupWalletConnection();

    await expect(page.getByText("Unbonded", { exact: true })).toBeVisible();
  });
});
