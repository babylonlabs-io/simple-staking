export const MULTISTAKING_FORM_SELECTORS = {
  CHAIN_SELECTION_BUTTON: "text=Select Available BSN",
  FP_SELECTION_BUTTON: "text=Select Babylon Genesis Finality Provider",
};

// TODO: Replace with data-testid selectors when components are updated
export const STAKING_FORM_SELECTORS = {
  STEP_2_HEADING: "text=Step 2",
  SET_AMOUNT_TEXT: "text=Set Staking Amount",
  PREVIEW_BUTTON: 'button:has-text("Preview")',
};

export const FORM_SELECTORS = {
  MULTISTAKING: MULTISTAKING_FORM_SELECTORS,
  STAKING: STAKING_FORM_SELECTORS,
};
