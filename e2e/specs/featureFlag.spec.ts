import { test } from "@playwright/test";

import { FormActions, PageNavigationActions } from "../fixtures";

test.describe("Feature Flag - Multistaking", () => {
  let navigationActions: PageNavigationActions;
  let formActions: FormActions;

  test.beforeEach(async ({ page }) => {
    navigationActions = new PageNavigationActions(page);
    formActions = new FormActions(page);
  });

  test("should ensure correct component is rendered when the feature flag is set", async ({
    page,
  }) => {
    process.env.FF_MULTISTAKING = "false";

    await navigationActions.navigateToHomePage(page);

    // Verify MultistakingForm elements are not visible
    await formActions.verifyMultistakingFormNotVisible();

    // Verify StakingForm elements are visible
    await formActions.verifyStakingFormVisible();
  });
});
