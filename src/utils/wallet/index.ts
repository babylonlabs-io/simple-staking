import { UTXO } from "@babylonlabs-io/btc-staking-ts";
import { networks } from "bitcoinjs-lib";

import { Network } from "@/app/types/network";

const nativeSegwitAddressLength = 42;
const taprootAddressLength = 62;
export const LOW_VALUE_UTXO_THRESHOLD = 10000;

export const toNetwork = (network: Network): networks.Network => {
  switch (network) {
    case Network.MAINNET:
    case Network.CANARY:
      return networks.bitcoin;
    case Network.TESTNET:
    case Network.SIGNET:
      return networks.testnet;
    default:
      // wallet error
      throw new Error("Unsupported network");
  }
};

export const isSupportedAddressType = (address: string): boolean => {
  return (
    address.length === nativeSegwitAddressLength ||
    address.length === taprootAddressLength
  );
};

export const isTaproot = (address: string): boolean => {
  return address.length === taprootAddressLength;
};

export const getPublicKeyNoCoord = (pkHex: string): Buffer => {
  const publicKey = Buffer.from(pkHex, "hex");
  return publicKey.subarray(1, 33);
};

export const filterDust = (utxos: UTXO[], limit = LOW_VALUE_UTXO_THRESHOLD) =>
  utxos.filter((utxo) => utxo.value > limit);
