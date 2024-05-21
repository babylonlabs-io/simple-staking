'use client';

import KeystoneSDK, { UR, URType } from "@keystonehq/keystone-sdk"
// import { genPsbtOfBIP322Simple, getSignatureFromPsbtOfBIP322Simple } from '@unisat/wallet-sdk/lib/message';
import { NetworkType } from "@unisat/wallet-sdk/lib/network";
import sdk, { PlayStatus, ReadStatus, SupportedResult } from '@keystonehq/sdk';
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
import { Psbt } from "bitcoinjs-lib";


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
    private viewSdk: typeof sdk;
    private dataSdk: KeystoneSDK;

    constructor() {
        super();
        sdk.bootstrap();
        this.viewSdk = sdk;
        this.dataSdk = new KeystoneSDK({
            origin: "babylon staking app"
        });;
    }

    async connectWallet(): Promise<this> {
        const keystoneContainer = this.viewSdk.getSdk();
        const decodedResult = await keystoneContainer.read(
            [SupportedResult.UR_CRYPTO_ACCOUNT],
            {
                title: "Sync Keystone with Babylon Staking App",
                description: "Please scan the QR code displayed on your Keystone, Currently Only the first Taproot Adress will be used",
                renderInitial: {
                    walletMode: "Web3",
                    link: ""
                },
                URTypeErrorMessage:
                    "The scanned QR code is not the sync code from the Keystone hardware wallet. Please verify the code and try again.",
            }
        );

        if (decodedResult.status === ReadStatus.success) {
            const accountData = this.dataSdk.parseAccount(decodedResult.result);
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
        let psbt = Psbt.fromHex(psbtHex);
        const bip32Derivation = {
            masterFingerprint: Buffer.from(this.keystoneWaleltInfo!.mfp!, 'hex'),
            path: `${this.keystoneWaleltInfo!.path!}/0/0`,
            pubkey: Buffer.from(this.keystoneWaleltInfo!.publicKeyHex!, 'hex')
        };

        psbt.data.inputs.forEach((input) => {
            input.tapBip32Derivation = [{
                ...bip32Derivation,
                pubkey: bip32Derivation.pubkey.slice(1),
                leafHashes: []
            }]
        })
        let enhancedPsbt = psbt.toHex();

        const ur = this.dataSdk.btc.generatePSBT(Buffer.from(enhancedPsbt, 'hex'));
        const keystoneContainer = this.viewSdk.getSdk();
        const status = await keystoneContainer.play(ur);
        if (status === PlayStatus.success) {
            let urResult = await keystoneContainer.read([SupportedResult.UR_PSBT], {
                title: "Get the Signature from Keystone",
                description: "Please scan the QR code displayed on your Keystone",
                URTypeErrorMessage:
                    "The scanned QR code can't be read. Please verify and try again.",
            });
            if (urResult.status === ReadStatus.success) {
                const signedPsbt = this.dataSdk.btc.parsePSBT(urResult.result);
                let psbt = Psbt.fromHex(signedPsbt)
                psbt.finalizeAllInputs()
                return psbt.toHex();
            } else {
                throw new Error("Extracting signature error, Please try again.")
            }
        } else {
            throw new Error("Error genering the QR code, Please try again.")
        }
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
        // const psbt = genPsbtOfBIP322Simple({
        //     message,
        //     address: this.keystoneWaleltInfo!.address!,
        //     networkType: NetworkType.TESTNET,
        // });

        // const ur = this.dataSdk.btc.generatePSBT(Buffer.from(psbt.toHex(), 'hex'));

        // const keystoneContainer = this.viewSdk.getSdk();
        // const status = await keystoneContainer.play(ur);
        // if (status === PlayStatus.success) {
        //     let urResult = await keystoneContainer.read([SupportedResult.UR_PSBT], {
        //         title: "Get the Signature from Keystone",
        //         description: "Please scan the QR code displayed on your Keystone",
        //         renderInitial: {
        //             walletMode: "Web3",
        //             link: "",
        //         },
        //         URTypeErrorMessage:
        //             "The scanned QR code can't be read. Please verify and try again.",
        //     });
        //     if (urResult.status === ReadStatus.success) {
        //         const signedPsbt = this.dataSdk.btc.parsePSBT(urResult.result);
        //         let psbt = Psbt.fromHex(signedPsbt)
        //         const signature = getSignatureFromPsbtOfBIP322Simple(psbt);
        //         return signature;
        //     } else {
        //         throw new Error("Extracting signature error, Please try again.")
        //     }
        // } else {
        //     throw new Error("Error genering the QR code, Please try again.")
        // }
        throw new Error("Get Key error.");
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