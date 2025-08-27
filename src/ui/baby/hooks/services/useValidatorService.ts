import { useMemo } from "react";

import { getNetworkConfigBBN } from "@/ui/common/config/network/bbn";
import { useClientQuery } from "@/ui/common/hooks/client/useClient";

import { usePool } from "../api/usePool";
import { useValidators } from "../api/useValidators";

export interface Validator {
  address: string;
  name: string;
  votingPower: number;
  commission: number;
  tokens: number;
  unbondingTime: number;
  status: "active" | "inactive" | "jailed" | "slashed";
  // apr: number;
  // logoUrl: string;
}

export function useValidatorService() {
  const { data: validatorList = [], isLoading } = useValidators();
  const { data: pool, isLoading: isPoolLoading } = usePool();

  const { lcdUrl } = getNetworkConfigBBN();

  const { data: signingInfos = [] } = useClientQuery<
    { address: string; tombstoned: boolean }[],
    Error,
    { address: string; tombstoned: boolean }[],
    [string]
  >({
    queryKey: ["BABY_SLASHING_SIGNING_INFOS"],
    queryFn: async () => {
      const results: { address: string; tombstoned: boolean }[] = [];
      let nextKey: string | undefined = undefined;
      do {
        const url = new URL(`${lcdUrl}/cosmos/slashing/v1beta1/signing_infos`);
        if (nextKey) url.searchParams.set("pagination.key", nextKey);
        url.searchParams.set("pagination.limit", "200");

        const resp = await fetch(url.toString());
        if (!resp.ok) break;
        const json = await resp.json();
        const infos = (json?.info ?? json?.signing_infos ?? []).map(
          (i: any) => ({
            address: i.address,
            tombstoned: Boolean(i.tombstoned),
          }),
        );
        results.push(...infos);
        nextKey = json?.pagination?.next_key ?? json?.pagination?.nextKey;
      } while (nextKey);
      return results;
    },
  });

  const { data: validatorSetLatest = [] } = useClientQuery<
    { address: string; pub_key?: { key?: string } }[],
    Error,
    { address: string; pub_key?: { key?: string } }[],
    [string]
  >({
    queryKey: ["BABY_VALIDATORSET_LATEST"],
    queryFn: async () => {
      const results: { address: string; pub_key?: { key?: string } }[] = [];
      let nextKey: string | undefined = undefined;
      do {
        const url = new URL(
          `${lcdUrl}/cosmos/base/tendermint/v1beta1/validatorsets/latest`,
        );
        if (nextKey) url.searchParams.set("pagination.key", nextKey);
        url.searchParams.set("pagination.limit", "200");
        const resp = await fetch(url.toString());
        if (!resp.ok) break;
        const json = await resp.json();
        const validators = json?.validators ?? [];
        results.push(...validators);
        nextKey = json?.pagination?.next_key ?? json?.pagination?.nextKey;
      } while (nextKey);
      return results;
    },
  });

  const consAddrMap = useMemo(() => {
    return new Map<string, string>(
      validatorSetLatest
        .map((v) => [v?.pub_key?.key, v.address] as const)
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
          const status: Validator["status"] = isSlashed
            ? "slashed"
            : isJailed
              ? "jailed"
              : isInActiveSet
                ? "active"
                : "inactive";

          return {
            address: validator.operatorAddress,
            name: validator.description.moniker,
            tokens,
            votingPower,
            commission,
            unbondingTime,
            status,
            // apr: 0,
            // logoUrl: "",
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
