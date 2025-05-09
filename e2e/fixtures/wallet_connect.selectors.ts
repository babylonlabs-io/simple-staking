// Note: These should be replaced by data-testid selectors

export const CONNECT_BUTTON_SELECTOR = 'button:has-text("Connect")';

export const DIALOG_SELECTORS = {
  TERMS_DIALOG_HEADER: '[class*="bbn-dialog-header"]',
  ANY_DIALOG: 'dialog, [role="dialog"]',
  ERROR_DIALOG: '[role="dialog"]:has-text("The wallet cannot be connected")',
  ERROR_DIALOG_DONE_BUTTON:
    '[role="dialog"]:has-text("The wallet cannot be connected") button:has-text("Done")',
};

export const BUTTON_SELECTORS = {
  NEXT: 'button:has-text("Next")',
  ACCEPT: 'button:has-text("Accept")',
  CONTINUE: 'button:has-text("Continue")',
  OK: 'button:has-text("OK")',
  SAVE: '.bbn-dialog-footer button:has-text("Save")',
  DONE: '.bbn-dialog-footer button:has-text("Done")',
};

export const CHECKBOX_SELECTOR = '.bbn-switcher-input[type="checkbox"]';

export const WALLET_SELECTORS = {
  BITCOIN: 'button:has-text("Select Bitcoin Wallet")',
  OKX: [
    'button:has-text("OKX")',
    'div[role="button"]:has-text("OKX")',
    '[data-testid="wallet-option-okx"]',
    'button:has-img[alt="OKX"]',
  ],
  BABYLON: [
    'button:has-text("Select Babylon Chain Wallet")',
    'button:has-img[alt="Babylon Chain"]',
    "button:has(.bbn-avatar)",
  ],
};

export const createGenericWalletSelector = (walletType: string) =>
  `button:has(.h-10.w-10.object-contain):has-text("${walletType}")`;
