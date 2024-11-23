import { BBNWidget } from "./BBNWidget";
import { BTCWidget } from "./BTCWidget";

export const walletWidgets = {
  BTC: <BTCWidget />,
  BBN: <BBNWidget />,
} as const;
