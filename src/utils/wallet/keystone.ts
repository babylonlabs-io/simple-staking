'use client';

import KeystoneSDK, { UR, URType } from "@keystonehq/keystone-sdk"
import sdk, { ReadStatus, SupportedResult } from '@keystonehq/sdk';
import * as bitcoin from 'bitcoinjs-lib';
import { toXOnly } from 'bitcoinjs-lib/src/psbt/bip371';
import { HDKey } from "@scure/bip32";

import { WalletProvider, Network, Fees, UTXO } from "./wallet_provider";
import {
    getAddressBalance,
    getTipHeight,
    getFundingUTXOs,
    getNetworkFees,
    pushTx,
} from "../mempool_api";


type KeystoneWalletInfo = {
    //   publicKeyHex: string;
    extendedPublicKey: string | undefined;
    path: string | undefined;
    address: string | undefined;
    publicKeyHex: string | undefined;
    mfp: string | undefined;
};

export class KeystoneWallet extends WalletProvider {
    private keystoneWaleltInfo: KeystoneWalletInfo | undefined;
    private sdk: typeof sdk;

    constructor() {
        super();
        sdk.bootstrap();
        this.sdk = sdk;
    }

    async connectWallet(): Promise<this> {
        const keystoneContainer = this.sdk.getSdk();
        const keystoneSdk = new KeystoneSDK({
            origin: "babylon staking app"
        });
        const decodedResult = await keystoneContainer.read(
            [SupportedResult.UR_CRYPTO_ACCOUNT],
            {
                title: "Sync Keystone with Babylon Staking App",
                description: "Please scan the QR code displayed on your Keystone, Currently Only the first Taproot Adress will be used",
                renderInitial: {
                    walletMode: "Web3",
                    link: "https://keyst.one",
                },
                URTypeErrorMessage:
                    "The scanned QR code is not the sync code from the Keystone hardware wallet. Please verify the code and try again.",
            }
        );

        if (decodedResult.status === ReadStatus.success) {
            const accountData = keystoneSdk.parseAccount(decodedResult.result);
            let xpub = accountData.keys[3].extendedPublicKey;
            this.keystoneWaleltInfo = {
                mfp: accountData.masterFingerprint,
                extendedPublicKey: xpub,
                path: accountData.keys[3].path,
                address: undefined,
                publicKeyHex: undefined,
            }

            if (this.keystoneWaleltInfo.extendedPublicKey) {
                const { address, pubkeyHex } = generateBitcoinAddressFromXpub(this.keystoneWaleltInfo.extendedPublicKey, "M/0/0", bitcoin.networks.testnet);
                this.keystoneWaleltInfo.address = address;
                this.keystoneWaleltInfo.publicKeyHex = pubkeyHex;
            }
        } else {
            throw new Error("Error reading QR code, Please try again.")
        }

        return (this)

    }
    async getWalletProviderName(): Promise<string> {
        return "Keystone";
    }
    async getAddress(): Promise<string> {
        if (this.keystoneWaleltInfo?.address) {
            return this.keystoneWaleltInfo?.address;
        }
        throw new Error("Get Address error.");
    }
    async getPublicKeyHex(): Promise<string> {
        if (this.keystoneWaleltInfo?.publicKeyHex) {
            return this.keystoneWaleltInfo?.publicKeyHex;
        }
        throw new Error("Get Key error.");
    }

    async signPsbt(psbtHex: string): Promise<string> {
        throw new Error("Method not implemented.");
    }

    async signPsbts(psbtsHexes: string[]): Promise<string[]> {
        let result = [];
        for (const psbt of psbtsHexes) {
            const signedHex = await this.signPsbt(psbt);
            result.push(signedHex);
        }
        return result;
    }

    async getNetwork(): Promise<Network> {
        return "testnet"
    }

    async signMessageBIP322(message: string): Promise<string> {
        throw new Error("Method not implemented.");
    }

    on(eventName: string, callBack: () => void): void {
        console.error('this function is not supported on Keystone', eventName)
    }


    // Mempool calls

    getBalance = async (): Promise<number> => {
        return await getAddressBalance(await this.getAddress());
    };

    getNetworkFees = async (): Promise<Fees> => {
        return await getNetworkFees();
    };

    pushTx = async (txHex: string): Promise<string> => {
        return await pushTx(txHex);
    };

    getUtxos = async (address: string, amount: number): Promise<UTXO[]> => {
        // mempool call
        return await getFundingUTXOs(address, amount);
    };

    getBTCTipHeight = async (): Promise<number> => {
        return await getTipHeight();
    };

}


function generateBitcoinAddressFromXpub(xpub: string, path: string, network: bitcoin.Network): { address: string, pubkeyHex: string } {
    const hdNode = HDKey.fromExtendedKey(xpub);
    const derivedNode = hdNode.derive(path);
    let pubkeyBuffer = Buffer.from(derivedNode.publicKey!);
    const childNodeXOnlyPubkey = toXOnly(pubkeyBuffer);
    const { address } = bitcoin.payments.p2tr({
        internalPubkey: childNodeXOnlyPubkey,
        network: bitcoin.networks.testnet
    });
    return { address: address!, pubkeyHex: pubkeyBuffer.toString('hex') }
}