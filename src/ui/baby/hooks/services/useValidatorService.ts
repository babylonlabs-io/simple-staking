import { useMemo } from "react";

import { usePool } from "../api/usePool";
import { useValidators } from "../api/useValidators";

export interface Validator {
  address: string;
  name: string;
  votingPower: number;
  commission: number;
  tokens: number;
  unbondingTime: number;
  // apr: number;
  // logoUrl: string;
}

export function useValidatorService() {
  const { data: validatorList = [], isLoading } = useValidators();
  const { data: pool, isLoading: isPoolLoading } = usePool();

  const validators = useMemo(
    () =>
      validatorList.map((validator) => ({
        address: validator.operatorAddress,
        name: validator.description.moniker,
        tokens: parseFloat(validator.tokens),
        votingPower: parseFloat(validator.tokens) / (pool?.bondedTokens ?? 0),
        commission: parseFloat(validator.commission.commissionRates.rate),
        unbondingTime: Number(validator.unbondingTime.seconds) * 1000,
        // apr: 0,
        // logoUrl: "",
      })),
    [validatorList, pool?.bondedTokens],
  );

  const validatorMap = useMemo(
    () =>
      validators.reduce(
        (acc, item) => ({ ...acc, [item.address]: item }),
        {} as Record<string, Validator>,
      ),
    [validators],
  );

  return { validators, validatorMap, loading: isLoading || isPoolLoading };
}
