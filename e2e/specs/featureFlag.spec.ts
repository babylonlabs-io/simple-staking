import { test } from "@playwright/test";

import {
  FormActions,
  PageNavigationActions,
  WalletConnectActions,
} from "../fixtures";

test.describe("Feature Flag - Multistaking", () => {
  let navigationActions: PageNavigationActions;
  let formActions: FormActions;
  let connectActions: WalletConnectActions;

  test.beforeEach(async ({ page }) => {
    navigationActions = new PageNavigationActions(page);
    connectActions = new WalletConnectActions(page);
    formActions = new FormActions(page);

    await navigationActions.navigateToHomePage(page);
    await connectActions.setupWalletConnection();
  });

  test("should ensure correct component is rendered when the feature flag is set", async ({
    page,
  }) => {
    process.env.FF_MULTISTAKING = "false";

    await formActions.verifyMultistakingFormNotVisible();
    await formActions.verifyStakingFormVisible();
  });
});
