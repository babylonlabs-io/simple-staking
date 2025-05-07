// Note: These should be replaced by data-testid selectors

export const connectButtonSelector = 'button:has-text("Connect")';

export const dialogSelectors = {
  termsDialogHeader: '[class*="bbn-dialog-header"]',
  anyDialog: 'dialog, [role="dialog"]',
  errorDialog: '[role="dialog"]:has-text("The wallet cannot be connected")',
  errorDialogDoneButton:
    '[role="dialog"]:has-text("The wallet cannot be connected") button:has-text("Done")',
};

export const buttonSelectors = {
  next: 'button:has-text("Next")',
  accept: 'button:has-text("Accept")',
  continue: 'button:has-text("Continue")',
  ok: 'button:has-text("OK")',
  save: '.bbn-dialog-footer button:has-text("Save")',
  done: '.bbn-dialog-footer button:has-text("Done")',
};

export const checkboxSelector = '.bbn-switcher-input[type="checkbox"]';

export const walletSelectors = {
  bitcoin: 'button:has-text("Select Bitcoin Wallet")',
  okx: [
    'button:has-text("OKX")',
    'div[role="button"]:has-text("OKX")',
    '[data-testid="wallet-option-okx"]',
    'button:has-img[alt="OKX"]',
  ],
  babylon: [
    'button:has-text("Select Babylon Chain Wallet")',
    'button:has-img[alt="Babylon Chain"]',
    "button:has(.bbn-avatar)",
  ],
};

export const createGenericWalletSelector = (walletType: string) =>
  `button:has(.h-10.w-10.object-contain):has-text("${walletType}")`;
