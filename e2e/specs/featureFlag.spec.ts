import { expect, test } from "@playwright/test";

import { PageNavigationActions } from "../fixtures";

test.describe("Feature Flag - Multistaking", () => {
  let navigationActions: PageNavigationActions;

  test.beforeEach(async ({ page }) => {
    navigationActions = new PageNavigationActions(page);
  });

  test("should ensure correct component is rendered when the feature flag is set", async ({
    page,
  }) => {
    process.env.FF_MULTISTAKING = "false";

    await navigationActions.navigateToHomePage(page);

    // Verify MultistakingForm elements are not visible
    const chainSelectionButton = page.locator("text=Select Available BSN");
    const fpSelectionButton = page.locator(
      "text=Select Babylon Genesis Finality Provider",
    );
    await expect(chainSelectionButton).not.toBeVisible();
    await expect(fpSelectionButton).not.toBeVisible();

    // Verify StakingForm elements are visible
    const step2Heading = page.locator("text=Step 2");
    const setAmountText = page.locator("text=Set Staking Amount");
    const previewButton = page.locator("button").filter({ hasText: "Preview" });
    await expect(step2Heading).toBeVisible();
    await expect(setAmountText).toBeVisible();
    await expect(previewButton).toBeVisible();
  });
});
