'use client';

import KeystoneSDK from "@keystonehq/keystone-sdk"
import sdk, { PlayStatus, ReadStatus, SupportedResult } from '@keystonehq/sdk';
import * as bitcoin from 'bitcoinjs-lib';
import { Psbt } from "bitcoinjs-lib";
import { tapleafHash } from 'bitcoinjs-lib/src/payments/bip341';
import { pubkeyInScript } from 'bitcoinjs-lib/src/psbt/psbtutils';
import { toXOnly } from 'bitcoinjs-lib/src/psbt/bip371';
import { PsbtInput } from 'bip174/src/lib/interfaces';
import { HDKey } from "@scure/bip32";


import { WalletProvider, Network, Fees, UTXO } from "../../wallet_provider";
import { toNetwork } from "../..";
import { generatePsbtOfBIP322Simple, extractSignatureFromPsbtOfBIP322Simple, NetworkType } from './lib';
import {
    getAddressBalance,
    getTipHeight,
    getFundingUTXOs,
    getNetworkFees,
    pushTx,
} from "../../../mempool_api";


type KeystoneWalletInfo = {
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

    connectWallet = async (): Promise<this> => {
        const keystoneContainer = this.viewSdk.getSdk();

        // Initialize the Keystone container and read the QR code for sync keystone device with the staking app.
        const decodedResult = await keystoneContainer.read(
            [SupportedResult.UR_CRYPTO_ACCOUNT],
            {
                title: "Sync Keystone with Babylon Staking App",
                description: "Please scan the QR code displayed on your Keystone, Currently Only the first Taproot Address will be used",
                renderInitial: {
                    walletMode: "btc",
                    link: "",
                    description: [
                        '1. Turn on your Keystone 3 with BTC only firmware.',
                        '2. Click connect software wallet and use "Sparrow" for connection.',
                        '3. Press the "Scan Keystone" button and scan the QR Code displayed on your Keystone hardware wallet',
                        '4. The first Taproot address will be used for staking.'
                    ],

                },
                URTypeErrorMessage:
                    "The scanned QR code is not the sync code from the Keystone hardware wallet. Please verify the code and try again.",
            }
        );

        if (decodedResult.status !== ReadStatus.success) throw new Error("Error reading QR code, Please try again.");

        // parse the QR Code and get extended public key and other required information
        const accountData = this.dataSdk.parseAccount(decodedResult.result);

        // currently only the p2tr address will be used.
        const P2TRINDEX = 3;
        let xpub = accountData.keys[P2TRINDEX].extendedPublicKey;

        this.keystoneWaleltInfo = {
            mfp: accountData.masterFingerprint,
            extendedPublicKey: xpub,
            path: accountData.keys[P2TRINDEX].path,
            address: undefined,
            publicKeyHex: undefined,
        }

        if (!this.keystoneWaleltInfo.extendedPublicKey) throw new Error("Could not retrieve the extended public key");

        // generate the address and public key based on the xpub
        const curentNetwork = await this.getNetwork();
        const { address, pubkeyHex } = generateBitcoinAddressFromXpub(this.keystoneWaleltInfo.extendedPublicKey, "M/0/0", toNetwork(curentNetwork));
        this.keystoneWaleltInfo.address = address;
        this.keystoneWaleltInfo.publicKeyHex = pubkeyHex;
        return (this);

    }

    getWalletProviderName = async (): Promise<string> => {
        return "Keystone";
    }

    getAddress = async (): Promise<string> => {
        if (this.keystoneWaleltInfo?.address) {
            return this.keystoneWaleltInfo?.address;
        }
        throw new Error("Could not retrieve the address");
    }

    getPublicKeyHex = async (): Promise<string> => {
        if (this.keystoneWaleltInfo?.publicKeyHex) {
            return this.keystoneWaleltInfo?.publicKeyHex;
        }
        throw new Error("Could not retrieve the BTC public key");
    }

    signPsbt = async (psbtHex: string): Promise<string> => {
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
                leafHashes: caculateTapLeafHash(input, bip32Derivation.pubkey)
            }]
        });

        let enhancedPsbt = psbt.toHex();

        const ur = this.dataSdk.btc.generatePSBT(Buffer.from(enhancedPsbt, 'hex'));
        const keystoneContainer = this.viewSdk.getSdk();
        const status = await keystoneContainer.play(ur, {
            title: "Scan the QR Code",
            description: "Please scan the QR code with your Keystone device.",
        });
        if (status === PlayStatus.success) {
            let urResult = await keystoneContainer.read([SupportedResult.UR_PSBT], {
                title: "Get the Signature from Keystone",
                description: "Please scan the QR code displayed on your Keystone",
                URTypeErrorMessage:
                    "The scanned QR code can't be read. please verify and try again.",
            });
            if (urResult.status === ReadStatus.success) {
                const signedPsbt = this.dataSdk.btc.parsePSBT(urResult.result);
                let psbt = Psbt.fromHex(signedPsbt);
                psbt.finalizeAllInputs();
                return psbt.toHex();
            } else {
                throw new Error("Could not extract the signature, please try again.")
            }
        } else {
            throw new Error("Could not generate the QR code, please try again.")
        }
    }

    signPsbts = async (psbtsHexes: string[]): Promise<string[]> => {
        let result = [];
        for (const psbt of psbtsHexes) {
            const signedHex = await this.signPsbt(psbt);
            result.push(signedHex);
        }
        return result;
    }

    getNetwork = async (): Promise<Network> => {
        return "signet"
    }

    signMessageBIP322 = async (message: string): Promise<string> => {
        const psbt = generatePsbtOfBIP322Simple({
            message,
            address: this.keystoneWaleltInfo!.address!,
            networkType: NetworkType.TESTNET,
        });

        const bip32Derivation = {
            masterFingerprint: Buffer.from(this.keystoneWaleltInfo!.mfp!, 'hex'),
            path: `${this.keystoneWaleltInfo!.path!}/0/0`,
            pubkey: Buffer.from(this.keystoneWaleltInfo!.publicKeyHex!, 'hex')
        };

        psbt.data.inputs.forEach((input) => {
            input.bip32Derivation = [{
                ...bip32Derivation,
            }]
        });

        let enhancedPsbt = psbt.toHex();

        const ur = this.dataSdk.btc.generatePSBT(Buffer.from(enhancedPsbt, 'hex'));

        const keystoneContainer = this.viewSdk.getSdk();
        const status = await keystoneContainer.play(ur);
        if (status === PlayStatus.success) {
            let urResult = await keystoneContainer.read([SupportedResult.UR_PSBT], {
                title: "Get the Signature from Keystone",
                description: "Please scan the QR code displayed on your Keystone",
                URTypeErrorMessage:
                    "The scanned QR code can't be read, please verify and try again.",
            });
            if (urResult.status === ReadStatus.success) {
                const signedPsbt = this.dataSdk.btc.parsePSBT(urResult.result);
                let psbt = Psbt.fromHex(signedPsbt)
                psbt.finalizeAllInputs();
                const signature = extractSignatureFromPsbtOfBIP322Simple(psbt);
                return signature;
            } else {
                throw new Error("Could not extract the signature, please try again.")
            }
        } else {
            throw new Error("Could not generate the QR code, please try again.")
        }
    }

    on = (eventName: string, callBack: () => void): void => {
        console.error('this function currently is not supported on Keystone', eventName)
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

/**
 * Generates the p2tr Bitcoin address from an extended public key and a path.
 * @param xpub - The extended public key.
 * @param path - The derivation path.
 * @param network - The Bitcoin network.
 * @returns The Bitcoin address and the public key as a hex string.
 */

const generateBitcoinAddressFromXpub = (xpub: string, path: string, network: bitcoin.Network): { address: string, pubkeyHex: string } => {
    const hdNode = HDKey.fromExtendedKey(xpub);
    const derivedNode = hdNode.derive(path);
    let pubkeyBuffer = Buffer.from(derivedNode.publicKey!);
    const childNodeXOnlyPubkey = toXOnly(pubkeyBuffer);
    const { address } = bitcoin.payments.p2tr({
        internalPubkey: childNodeXOnlyPubkey,
        network,
    });
    return { address: address!, pubkeyHex: pubkeyBuffer.toString('hex') }
}

/**
 * Calculates the tap leaf hashes for a given PsbtInput and public key.
 * @param input - The PsbtInput object.
 * @param pubkey - The public key as a Buffer.
 * @returns An array of tap leaf hashes.
 */
const caculateTapLeafHash = (input: PsbtInput, pubkey: Buffer) => {
    if (input.tapInternalKey && !input.tapLeafScript) {
        return [];
    } else {
        const tapLeafHashes = (input.tapLeafScript || [])
            .filter(tapLeaf => pubkeyInScript(pubkey, tapLeaf.script))
            .map(tapLeaf => {
                const hash = tapleafHash({
                    output: tapLeaf.script,
                    version: tapLeaf.leafVersion,
                });
                return Object.assign({ hash }, tapLeaf);
            })

        return tapLeafHashes.map(each => each.hash);
    }
}