import { OKXWallet } from "./okx_wallet";
import { Network, WalletProvider } from "./wallet_provider";
import { networks, Psbt, Transaction } from "bitcoinjs-lib";

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