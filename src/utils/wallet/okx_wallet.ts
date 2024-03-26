import { Psbt } from "bitcoinjs-lib";

import { WalletProvider, Network } from "./wallet_provider";

type OKXWalletInfo = {
    publicKeyHex: string;
    address: string;
};

export class OKXWallet extends WalletProvider {
    private okxWalletInfo: OKXWalletInfo | undefined;

    constructor() {
        super();
    }

    async connectWallet(): Promise<this> {
        const workingVersion = "2.83.26";
        // check whether there is an OKX Wallet extension
        if (!window.okxwallet) {
            throw new Error("OKX Wallet extension not found");
        }

        const version = await window.okxwallet.getVersion();
        if (version < workingVersion) {
            throw new Error("Please update OKX Wallet to the latest version");
        }

        const okxwallet = window.okxwallet;
        try {
            await okxwallet.enable(); // Connect to OKX Wallet extension
        } catch (error) {
            if ((error as Error)?.message?.includes("rejected")) {
                throw new Error("Connection to OKX Wallet was rejected");
            } else {
                throw new Error((error as Error)?.message);
            }
        }
        let result = null;
        try {
            // this will not throw an error even if user has no BTC Signet enabled
            result = await okxwallet?.bitcoinSignet?.connect();
        } catch (error) {
            throw new Error("BTC Signet is not enabled in OKX Wallet");
        }

        const { address, compressedPublicKey } = result;

        if (compressedPublicKey && address) {
            this.okxWalletInfo = {
                publicKeyHex: compressedPublicKey,
                address,
            };
            return this;
        } else {
            throw new Error("Could not connect to OKX Wallet");
        }
    }

    async getWalletProviderName(): Promise<string> {
        return "OKX";
    }

    async getAddress(): Promise<string> {
        if (!this.okxWalletInfo) {
            throw new Error("OKX Wallet not connected");
        }
        return this.okxWalletInfo.address;
    }

    async getPublicKeyHex(): Promise<string> {
        if (!this.okxWalletInfo) {
            throw new Error("OKX Wallet not connected");
        }
        return this.okxWalletInfo.publicKeyHex;
    }

    async signPsbt(psdtHex: string): Promise<string> {
        if (!this.okxWalletInfo) {
            throw new Error("OKX Wallet not connected");
        }
        // sign the PSBTs
        const response =
            await window?.okxwallet?.bitcoinSignet?.signPsbts([psdtHex]);

        // convert the signed PSBTs to transactions
        return response.map((tx: any) => Psbt.fromHex(tx).extractTransaction())[0].toHex();
    }

    async getNetwork(): Promise<Network> {
        return "testnet";
    }
}
