import { createLCDClient, txs, utils } from "@babylonlabs-io/babylon-proto-ts";

import { getNetworkConfigBBN } from "@/ui/common/config/network/bbn";

let clientInstance: Awaited<ReturnType<typeof createLCDClient>> | null = null;

export const getBabylonClient = async () => {
  if (!clientInstance) {
    const networkConfig = getNetworkConfigBBN();
    clientInstance = await createLCDClient({ url: networkConfig.lcdUrl });
  }
  return clientInstance;
};

export const getAllSigningInfos = async (): Promise<
  { address: string; tombstoned: boolean }[]
> => {
  const client = await getBabylonClient();
  const results: { address: string; tombstoned: boolean }[] = [];
  let nextKey: Uint8Array | undefined = undefined;
  do {
    const resp = await (client as any).cosmos.slashing.v1beta1.signingInfos({
      pagination: { key: nextKey, limit: BigInt(200) },
    });
    const infos = (resp.info ?? resp.signing_infos ?? []).map((i: any) => ({
      address: i.address,
      tombstoned: Boolean(i.tombstoned),
    }));
    results.push(...infos);
    nextKey = resp.pagination?.next_key as Uint8Array | undefined;
  } while (nextKey && nextKey.length > 0);
  return results;
};

export const getAllLatestValidatorSet = async (): Promise<
  { address: string; pub_key?: { key?: string } }[]
> => {
  const client = await getBabylonClient();
  const results: { address: string; pub_key?: { key?: string } }[] = [];
  let nextKey: Uint8Array | undefined = undefined;
  do {
    const resp = await (
      client as any
    ).cosmos.base.tendermint.v1beta1.getLatestValidatorSet({
      pagination: { key: nextKey, limit: BigInt(200) },
    });
    const validators = resp.validators ?? [];
    results.push(...validators);
    nextKey = resp.pagination?.next_key as Uint8Array | undefined;
  } while (nextKey && nextKey.length > 0);
  return results;
};

export default {
  client: getBabylonClient,
  txs,
  utils,
  getAllSigningInfos,
  getAllLatestValidatorSet,
};
