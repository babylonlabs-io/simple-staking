import { OKXWallet } from "./okx_wallet";
import { Network, WalletProvider } from "./wallet_provider";
import { networks } from "bitcoinjs-lib";

const nativeSegwitAddressLength = 42;
const taprootAddressLength = 62;

// Get the wallet provider from the window object, default to OKXWallet if not found.
export const getWallet = (): WalletProvider => {
    return window.bbnwallet ? window.bbnwallet : new OKXWallet();
}

export const toNetwork = (network: Network): networks.Network => {
    switch (network) {
        case "mainnet":
            return networks.bitcoin;
        case "testnet":
            return networks.testnet;
        case "regtest":
            return networks.regtest;
        default:
            throw new Error("Unsupported network");
    }
}

export const isSupportedAddressType = (address: string): boolean => {
    return address.length === nativeSegwitAddressLength || address.length === taprootAddressLength;
}

export const isTaproot = (address: string): boolean => {
    return address.length === taprootAddressLength;
}

export const getPublicKeyNoCoord = (pkHex: string): Buffer => {
    const publicKey = Buffer.from(pkHex, "hex");
    return publicKey.subarray(1, 33);
}
