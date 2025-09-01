import { useMemo } from "react";

import babylon from "@/infrastructure/babylon";
import { useClientQuery } from "@/ui/common/hooks/client/useClient";

import type { ValidatorStatus } from "../../types/validator";
import { usePool } from "../api/usePool";
import { useValidators } from "../api/useValidators";

export interface Validator {
  address: string;
  name: string;
  votingPower: number;
  commission: number;
  tokens: number;
  unbondingTime: number;
  status: ValidatorStatus;
}

function getValidatorStatus(
  isSlashed: boolean,
  isJailed: boolean,
  isInActiveSet: boolean,
): ValidatorStatus {
  if (isSlashed) return "slashed";
  if (isJailed) return "jailed";
  return isInActiveSet ? "active" : "inactive";
}

export function useValidatorService() {
  const { data: validatorList = [], isLoading } = useValidators();
  const { data: pool, isLoading: isPoolLoading } = usePool();

  const { data: signingInfos = [] } = useClientQuery<
    { address: string; tombstoned: boolean }[],
    Error,
    { address: string; tombstoned: boolean }[],
    [string]
  >({
    queryKey: ["BABY_SLASHING_SIGNING_INFOS"],
    queryFn: async () => {
      const client = await babylon.client();
      return client.baby.getSigningInfos();
    },
  });

  const { data: validatorSetLatest = [] } = useClientQuery<
    { address: string; pubKey?: { key?: string } }[],
    Error,
    { address: string; pubKey?: { key?: string } }[],
    [string]
  >({
    queryKey: ["BABY_VALIDATORSET_LATEST"],
    queryFn: async () => {
      const client = await babylon.client();
      return client.baby.getLatestValidatorSet();
    },
  });

  const consAddrMap = useMemo(() => {
    return new Map<string, string>(
      validatorSetLatest
        .map((v) => [v?.pubKey?.key, v.address] as const)
        .filter(([k]) => Boolean(k)) as [string, string][],
    );
  }, [validatorSetLatest]);

  const tombstonedSet = useMemo(() => {
    return new Set(
      signingInfos.filter((i) => i.tombstoned).map((i) => i.address),
    );
  }, [signingInfos]);

  const validators = useMemo(
    () =>
      validatorList
        .map((validator) => {
          const tokens = parseFloat(validator.tokens);
          const votingPower = tokens / (pool?.bondedTokens ?? 0);
          const commission = parseFloat(
            validator.commission.commissionRates.rate,
          );
          const unbondingTime = Number(validator.unbondingTime.seconds) * 1000;

          const consPubKey = (validator as any)?.consensusPubkey?.key as
            | string
            | undefined;
          const consAddr = consPubKey ? consAddrMap.get(consPubKey) : undefined;
          const isInActiveSet = Boolean(
            consPubKey && consAddrMap.has(consPubKey),
          );
          const isSlashed = consAddr ? tombstonedSet.has(consAddr) : false;
          const isJailed = Boolean((validator as any).jailed);
          const status: Validator["status"] = getValidatorStatus(
            isSlashed,
            isJailed,
            isInActiveSet,
          );

          return {
            address: validator.operatorAddress,
            name: validator.description.moniker,
            tokens,
            votingPower,
            commission,
            unbondingTime,
            status,
          };
        })
        .sort((a, b) => b.tokens - a.tokens),
    [validatorList, pool?.bondedTokens, consAddrMap, tombstonedSet],
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
