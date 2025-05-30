import { expect, Page } from "@playwright/test";

import { FORM_SELECTORS } from "./form.selectors";

export class FormActions {
  constructor(private page: Page) {}

  async verifyMultistakingFormNotVisible() {
    const chainSelectionButton = this.page.locator(
      FORM_SELECTORS.MULTISTAKING.CHAIN_SELECTION_BUTTON,
    );
    const fpSelectionButton = this.page.locator(
      FORM_SELECTORS.MULTISTAKING.FP_SELECTION_BUTTON,
    );

    await expect(chainSelectionButton).not.toBeVisible();
    await expect(fpSelectionButton).not.toBeVisible();
  }

  async verifyStakingFormVisible() {
    const step2Heading = this.page.locator(
      FORM_SELECTORS.STAKING.STEP_2_HEADING,
    );
    const setAmountText = this.page.locator(
      FORM_SELECTORS.STAKING.SET_AMOUNT_TEXT,
    );
    const previewButton = this.page.locator(
      FORM_SELECTORS.STAKING.PREVIEW_BUTTON,
    );

    await expect(step2Heading).toBeVisible();
    await expect(setAmountText).toBeVisible();
    await expect(previewButton).toBeVisible();
  }

  async verifyMultistakingFormVisible() {
    const chainSelectionButton = this.page.locator(
      FORM_SELECTORS.MULTISTAKING.CHAIN_SELECTION_BUTTON,
    );
    const fpSelectionButton = this.page.locator(
      FORM_SELECTORS.MULTISTAKING.FP_SELECTION_BUTTON,
    );

    await expect(chainSelectionButton).toBeVisible();
    await expect(fpSelectionButton).toBeVisible();
  }

  async verifyStakingFormNotVisible() {
    const step2Heading = this.page.locator(
      FORM_SELECTORS.STAKING.STEP_2_HEADING,
    );
    const setAmountText = this.page.locator(
      FORM_SELECTORS.STAKING.SET_AMOUNT_TEXT,
    );
    const previewButton = this.page.locator(
      FORM_SELECTORS.STAKING.PREVIEW_BUTTON,
    );

    await expect(step2Heading).not.toBeVisible();
    await expect(setAmountText).not.toBeVisible();
    await expect(previewButton).not.toBeVisible();
  }
}
