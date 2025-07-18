import { AmountSubsection } from "@babylonlabs-io/core-ui";
import { useMemo } from "react";

import { getNetworkConfigBTC } from "@/ui/common/config/network/btc";
import { usePrice } from "@/ui/common/hooks/client/api/usePrices";
import { useIsLoggedIn } from "@/ui/common/hooks/useIsLoggedIn";
import { useBalanceState } from "@/ui/common/state/BalanceState";
import { satoshiToBtc } from "@/ui/common/utils/btc";

export function AmountSection() {
  const { icon, name, coinSymbol, displayUSD } = getNetworkConfigBTC();
  const price = usePrice(coinSymbol);
  const { stakableBtcBalance } = useBalanceState();
  const stakableBTC = useMemo(
    () => satoshiToBtc(stakableBtcBalance),
    [stakableBtcBalance],
  );

  const isLoggedIn = useIsLoggedIn();

  return (
    <AmountSubsection
      fieldName="amount"
      currencyIcon={icon}
      currencyName={name}
      displayBalance={isLoggedIn}
      balanceDetails={{
        balance: stakableBTC,
        symbol: coinSymbol,
        price,
        displayUSD,
      }}
    />
  );
}
