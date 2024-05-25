import { networks } from "bitcoinjs-lib";

import { Network } from "./wallet_provider";

const nativeSegwitAddressLength = 42;
const taprootAddressLength = 62;

export const toNetwork = (network: Network): networks.Network => {
  switch (network) {
    case "mainnet":
      return networks.bitcoin;
    case "testnet":
    case "signet":
      return networks.testnet;
    case "regtest":
      return networks.regtest;
    default:
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
