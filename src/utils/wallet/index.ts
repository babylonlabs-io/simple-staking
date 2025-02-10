import { networks, payments } from "bitcoinjs-lib";
import { toXOnly } from "bitcoinjs-lib/src/psbt/bip371";

import { Network } from "./wallet_provider";

const nativeSegwitAddressLength = 42;
const taprootAddressLength = 62;
export const COMPRESSED_PUBLIC_KEY_HEX_LENGTH = 66;

export const toNetwork = (network: Network): networks.Network => {
  switch (network) {
    case Network.MAINNET:
      return networks.bitcoin;
    case Network.TESTNET:
    case Network.SIGNET:
      return networks.testnet;
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

export const getTaprootAddress = (publicKey: string, network: Network) => {
  if (publicKey.length == COMPRESSED_PUBLIC_KEY_HEX_LENGTH) {
    publicKey = publicKey.slice(2);
  }

  const internalPubkey = Buffer.from(publicKey, "hex");
  const { address, output: scriptPubKey } = payments.p2tr({
    internalPubkey: toXOnly(internalPubkey),
    network: toNetwork(network),
  });

  if (!address || !scriptPubKey) {
    throw new Error(
      "Failed to generate taproot address or script from public key",
    );
  }

  return address;
};

export const getNativeSegwitAddress = (publicKey: string, network: Network) => {
  if (publicKey.length !== COMPRESSED_PUBLIC_KEY_HEX_LENGTH) {
    throw new Error(
      "Invalid public key length for generating native segwit address",
    );
  }

  const internalPubkey = Buffer.from(publicKey, "hex");
  const { address, output: scriptPubKey } = payments.p2wpkh({
    pubkey: internalPubkey,
    network: toNetwork(network),
  });

  if (!address || !scriptPubKey) {
    throw new Error(
      "Failed to generate native segwit address or script from public key",
    );
  }

  return address;
};

export function validateAddressWithPK(
  address: string,
  publicKey: string,
  network: Network,
) {
  return (
    address === getTaprootAddress(publicKey, network) ||
    address === getNativeSegwitAddress(publicKey, network)
  );
}
