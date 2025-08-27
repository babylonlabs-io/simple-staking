import { AmountSubsection } from "@babylonlabs-io/core-ui";

import { getNetworkConfigBBN } from "@/ui/common/config/network/bbn";

const { logo, coinSymbol, displayUSD } = getNetworkConfigBBN();

interface AmountFieldProps {
  balance: number;
  price: number;
}

export const AmountField = ({ balance, price }: AmountFieldProps) => (
  <AmountSubsection
    autoFocus={false}
    displayBalance
    fieldName="amount"
    currencyIcon={logo}
    currencyName={coinSymbol}
    placeholder="Enter Amount"
    balanceDetails={{
      displayUSD,
      symbol: coinSymbol,
      balance,
      price,
      decimals: 2,
    }}
  />
);
