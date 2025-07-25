import { ONE_MINUTE } from "@/ui/legacy/constants";
import { getPrices } from "@/ui/legacy/utils/getPrices";

import { useClientQuery } from "../useClient";

export const PRICES_KEY = "PRICES";

export const usePrices = () => {
  return useClientQuery({
    queryKey: [PRICES_KEY],
    queryFn: getPrices,
    staleTime: ONE_MINUTE,
  });
};

export const usePrice = (symbol: string) => {
  const { data: prices } = usePrices();
  return prices?.[symbol] ?? 0;
};
