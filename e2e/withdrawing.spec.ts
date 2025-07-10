import { expect, test } from "@playwright/test";

import { DelegationState } from "@/ui/legacy/types/delegations";
import { getState } from "@/ui/legacy/utils/getState";

import { WalletConnectActions } from "./fixtures/wallet_connect";
import { interceptRequest } from "./helper/interceptRequest";
import { unbondedTX } from "./mock/tx/withdrawing";

test.describe("Create withdrawing transaction", () => {
  let actions: WalletConnectActions;

  test("prepare the withdrawing", async ({ page }) => {
    // Intercept the GET request for delegations
    await interceptRequest(page, "**/v1/staker/delegations**", 200, unbondedTX);
    // Intercept the Mempool POST request for withdrawing
    await interceptRequest(page, "**/api/tx", 200, {
      tx: "536af306eac15c7d87d852c601f52a23c2242f53c8c5f803c11befce090c3616",
    });
    await page.goto("/");
    actions = new WalletConnectActions(page);
    await actions.setupWalletConnection();

    // withdraw -> proceed
    await page.getByRole("button", { name: "Withdraw" }).click();
    await page.getByRole("button", { name: "Proceed" }).click();

    // expect the withdrawal state text instead of a button
    await expect(
      page.getByText(getState(DelegationState.INTERMEDIATE_WITHDRAWAL)),
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
    expect(parsed[0].state).toBe(DelegationState.INTERMEDIATE_WITHDRAWAL);
  });

  test("withdrawn", async ({ page }) => {
    // Modify the activeTX to reflect "withdrawn"
    const updatedTX = {
      ...unbondedTX,
      data: unbondedTX.data.map((tx) => ({
        ...tx,
        state: DelegationState.WITHDRAWN,
      })),
    };

    // Intercept the GET request for updated delegation
    await interceptRequest(page, "**/v1/staker/delegations**", 200, updatedTX);
    await page.goto("/");
    actions = new WalletConnectActions(page);
    await actions.setupWalletConnection();
    await expect(page.getByText("Withdrawn")).toBeVisible();

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
});
