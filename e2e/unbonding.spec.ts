import { expect, test } from "@playwright/test";

import { DelegationState } from "@/ui/legacy/types/delegations";
import { getState } from "@/ui/legacy/utils/getState";

import { WalletConnectActions } from "./fixtures/wallet_connect";
import { interceptRequest } from "./helper/interceptRequest";
import { activeTX, unbondingTX } from "./mock/tx/unbonding";

test.describe("Create unbonding transaction", () => {
  let actions: WalletConnectActions;

  test("prepare the unbonding", async ({ page }) => {
    // Intercept the GET request for delegations
    await interceptRequest(page, "**/v1/staker/delegations**", 200, activeTX);
    // Intercept the GET request for unbonding eligibility
    await interceptRequest(page, "**/v1/unbonding/eligibility**", 200);
    // Intercept the POST request for unbonding
    await interceptRequest(page, "**/v1/unbonding", 202, {
      message: "Request accepted",
    });
    await page.goto("/");
    actions = new WalletConnectActions(page);
    await actions.setupWalletConnection();

    // unbond -> proceed
    await page.getByRole("button", { name: "Unbond" }).click();
    await page.getByRole("button", { name: "Proceed" }).click();

    // expect the unbonding state text instead of a button
    await expect(
      page.getByText(getState(DelegationState.INTERMEDIATE_UNBONDING)),
    ).toBeVisible();

    // check for local storage
    const item = await page.evaluate(() =>
      localStorage.getItem(
        "bbn-staking-intermediate-delegations-4c6e2954c75bcb53aa13b7cd5d8bcdb4c9a4dd0784d68b115bd4408813b45608",
      ),
    );
    expect(item).not.toBeNull();
    const parsed = JSON.parse(item as string);
    expect(parsed).toHaveLength(1);
    expect(parsed[0].state).toBe(DelegationState.INTERMEDIATE_UNBONDING);
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

    // Intercept the GET request for updated delegation
    await interceptRequest(page, "**/v1/staker/delegations**", 200, updatedTX);
    await page.goto("/");
    actions = new WalletConnectActions(page);
    await actions.setupWalletConnection();
    await expect(page.getByText("Unbonding Requested")).toBeVisible();

    // check for local storage
    const item = await page.evaluate(() =>
      localStorage.getItem(
        "bbn-staking-intermediate-delegations-4c6e2954c75bcb53aa13b7cd5d8bcdb4c9a4dd0784d68b115bd4408813b45608",
      ),
    );
    expect(item).toBe("[]");
    const parsed = JSON.parse(item as string);
    expect(parsed).toHaveLength(0);
  });

  test("unbonded", async ({ page }) => {
    // Modify the activeTX to reflect "unbonding requested"
    const updatedTX = {
      ...activeTX,
      data: activeTX.data.map((tx) => ({
        ...tx,
        state: DelegationState.UNBONDED,
        unbonding_tx: unbondingTX,
      })),
    };

    // Intercept the GET request for updated delegation
    await interceptRequest(page, "**/v1/staker/delegations**", 200, updatedTX);
    await page.goto("/");
    actions = new WalletConnectActions(page);
    await actions.setupWalletConnection();
    await expect(page.getByText("Unbonded", { exact: true })).toBeVisible();
  });
});
