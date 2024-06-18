"use client";

import KeystoneSDK, { UR } from "@keystonehq/keystone-sdk";
import sdk, {
  PlayStatus,
  ReadStatus,
  SDK,
  SupportedResult,
} from "@keystonehq/sdk";
import { HDKey } from "@scure/bip32";
import { PsbtInput } from "bip174/src/lib/interfaces";
import {
  Network as BitcoinNetwork,
  Psbt,
  Transaction,
  payments,
} from "bitcoinjs-lib";
import { tapleafHash } from "bitcoinjs-lib/src/payments/bip341";
import { toXOnly } from "bitcoinjs-lib/src/psbt/bip371";
import { pubkeyInScript } from "bitcoinjs-lib/src/psbt/psbtutils";

import { getNetworkConfig } from "@/config/network.config";

import { toNetwork } from "../..";
import {
  getAddressBalance,
  getFundingUTXOs,
  getNetworkFees,
  getTipHeight,
  pushTx,
} from "../../../mempool_api";
import { WalletError, WalletErrorType } from "../../errors";
import { Fees, Network, UTXO, WalletProvider } from "../../wallet_provider";

import BIP322 from "./bip322";

type KeystoneWalletInfo = {
  mfp: string | undefined;
  extendedPublicKey: string | undefined;
  path: string | undefined;
  address: string | undefined;
  publicKeyHex: string | undefined;
  scriptPubKeyHex: string | undefined;
};

export class KeystoneWallet extends WalletProvider {
  private keystoneWaleltInfo: KeystoneWalletInfo | undefined;
  private viewSdk: typeof sdk;
  private dataSdk: KeystoneSDK;
  private networkEnv: Network | undefined;

  constructor() {
    super();
    sdk.bootstrap();
    this.viewSdk = sdk;
    this.dataSdk = new KeystoneSDK({
      origin: "babylon staking app",
    });
    this.networkEnv = getNetworkConfig().network;
  }

  /**
   * Connects the staking app to the Keystone device and retrieves the necessary information.
   * @returns A Promise that resolves to the current instance of the class.
   * @throws An error if there is an issue reading the QR code or retrieving the extended public key.
   */
  connectWallet = async (): Promise<this> => {
    const keystoneContainer = await this.viewSdk.getSdk();

    // Initialize the Keystone container and read the QR code for sync keystone device with the staking app.
    const decodedResult = await keystoneContainer.read(
      [SupportedResult.UR_CRYPTO_ACCOUNT],
      {
        title: "Sync Keystone with Babylon Staking App",
        description:
          "Please scan the QR code displayed on your Keystone, Currently only the first Taproot Address will be used",
        renderInitial: {
          walletMode: "btc",
          link: "",
          description: [
            "1. Turn on your Keystone 3 with BTC only firmware.",
            '2. Click connect software wallet and use "Sparrow" for connection.',
            '3. Press the "Sync Keystone" button and scan the QR Code displayed on your Keystone hardware wallet',
            "4. The first Taproot address will be used for staking.",
          ],
        },
        URTypeErrorMessage:
          "The scanned QR code is not the sync code from the Keystone hardware wallet. Please verify the code and try again.",
      },
    );
    if (decodedResult.status === ReadStatus.canceled) {
      throw new WalletError(
        WalletErrorType.ConnectionCancelled,
        "Connection cancelled",
      );
    } else if (decodedResult.status !== ReadStatus.success) {
      throw new Error("Error reading QR code, Please try again.");
    }

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
      scriptPubKeyHex: undefined,
    };

    if (!this.keystoneWaleltInfo.extendedPublicKey)
      throw new Error("Could not retrieve the extended public key");

    // generate the address and public key based on the xpub
    const curentNetwork = await this.getNetwork();
    const { address, pubkeyHex, scriptPubKeyHex } = generateP2trAddressFromXpub(
      this.keystoneWaleltInfo.extendedPublicKey,
      "M/0/0",
      toNetwork(curentNetwork),
    );
    this.keystoneWaleltInfo.address = address;
    this.keystoneWaleltInfo.publicKeyHex = pubkeyHex;
    this.keystoneWaleltInfo.scriptPubKeyHex = scriptPubKeyHex;
    return this;
  };

  getWalletProviderName = async (): Promise<string> => {
    return "Keystone";
  };

  getAddress = async (): Promise<string> => {
    if (this.keystoneWaleltInfo?.address) {
      return this.keystoneWaleltInfo?.address;
    }
    throw new Error("Could not retrieve the address");
  };

  getPublicKeyHex = async (): Promise<string> => {
    if (this.keystoneWaleltInfo?.publicKeyHex) {
      return this.keystoneWaleltInfo?.publicKeyHex;
    }
    throw new Error("Could not retrieve the BTC public key");
  };

  signPsbt = async (psbtHex: string): Promise<string> => {
    // enhance the PSBT with the BIP32 derivation information
    // to tell keystone which key to use to sign the PSBT
    let psbt = Psbt.fromHex(psbtHex);
    psbt = this.enhancePsbt(psbt);
    let enhancedPsbt = psbt.toHex();
    // sign the psbt with keystone
    const signedPsbt = await this.sign(enhancedPsbt);
    return signedPsbt.toHex();
  };

  signPsbts = async (psbtsHexes: string[]): Promise<string[]> => {
    let result = [];
    for (const psbt of psbtsHexes) {
      const signedHex = await this.signPsbt(psbt);
      result.push(signedHex);
    }
    return result;
  };

  getNetwork = async (): Promise<Network> => {
    if (!this.networkEnv) {
      throw new Error("Network not set");
    }
    return this.networkEnv;
  };

  /**
   * https://github.com/bitcoin/bips/blob/master/bip-0322.mediawiki
   * signMessageBIP322 signs a message using the BIP322 standard.
   * @param message
   * @returns signature
   */
  signMessageBIP322 = async (message: string): Promise<string> => {
    // construct the psbt of Bip322 message signing
    const scriptPubKey = Buffer.from(
      this.keystoneWaleltInfo!.scriptPubKeyHex!,
      "hex",
    );
    const toSpendTx = BIP322.buildToSpendTx(message, scriptPubKey);
    const internalPublicKey = toXOnly(
      Buffer.from(this.keystoneWaleltInfo!.publicKeyHex!, "hex"),
    );
    let psbt = BIP322.buildToSignTx(
      toSpendTx.getId(),
      scriptPubKey,
      false,
      internalPublicKey,
    );
    // Set the sighashType to bitcoin.Transaction.SIGHASH_ALL since it defaults to SIGHASH_DEFAULT
    psbt.updateInput(0, {
      sighashType: Transaction.SIGHASH_ALL,
    });

    // ehance the PSBT with the BIP32 derivation information
    psbt = this.enhancePsbt(psbt);
    const signedPsbt = await this.sign(psbt.toHex());
    return BIP322.encodeWitness(signedPsbt);
  };

  /**
   * Sign the PSBT with the Keystone device.
   *
   * @param psbtHex - The PSBT in hex format.
   *  @returns The signed PSBT in hex format.
   * */
  private sign = async (psbtHex: string): Promise<Psbt> => {
    const ur = this.dataSdk.btc.generatePSBT(Buffer.from(psbtHex, "hex"));

    // compose the signing process for the Keystone device
    const signPsbt = composeQRProcess(SupportedResult.UR_PSBT);

    const keystoneContainer = await this.viewSdk.getSdk();
    const signePsbtUR = await signPsbt(keystoneContainer, ur);

    // extract the signed PSBT from the UR
    const signedPsbtHex = this.dataSdk.btc.parsePSBT(signePsbtUR);
    let signedPsbt = Psbt.fromHex(signedPsbtHex);
    signedPsbt.finalizeAllInputs();
    return signedPsbt;
  };

  /**
   * Add the BIP32 derivation information for each input.
   * The Keystone device is stateless, so it needs to know which key to use to sign the PSBT.
   * Therefore, add the Taproot BIP32 derivation information to the PSBT.
   * https://github.com/bitcoin/bips/blob/master/bip-0174.mediawiki#Specification
   * @param psbt - The PSBT object.
   * @returns The PSBT object with the BIP32 derivation information added.
   */
  private enhancePsbt = (psbt: Psbt): Psbt => {
    const bip32Derivation = {
      masterFingerprint: Buffer.from(this.keystoneWaleltInfo!.mfp!, "hex"),
      path: `${this.keystoneWaleltInfo!.path!}/0/0`,
      pubkey: Buffer.from(this.keystoneWaleltInfo!.publicKeyHex!, "hex"),
    };

    psbt.data.inputs.forEach((input) => {
      input.tapBip32Derivation = [
        {
          ...bip32Derivation,
          pubkey: toXOnly(bip32Derivation.pubkey),
          leafHashes: caculateTapLeafHash(input, bip32Derivation.pubkey),
        },
      ];
    });
    return psbt;
  };

  on = (eventName: string, callBack: () => void): void => {
    console.error(
      "this function currently is not supported on Keystone",
      eventName,
    );
  };

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

  getUtxos = async (address: string, amount?: number): Promise<UTXO[]> => {
    // mempool call
    return await getFundingUTXOs(address, amount);
  };

  getBTCTipHeight = async (): Promise<number> => {
    return await getTipHeight();
  };
}

/**
 * High order function to compose the QR generation and scanning process for specific data types.
 * Composes the QR code process for the Keystone device.
 * @param destinationDataType - The type of data to be read from the QR code.
 * @returns A function that plays the UR in the QR code and reads the result.
 */
const composeQRProcess =
  (destinationDataType: SupportedResult) =>
  async (container: SDK, ur: UR): Promise<UR> => {
    // make the container play the UR in the QR code
    const status: PlayStatus = await container.play(ur, {
      title: "Scan the QR Code",
      description: "Please scan the QR code with your Keystone device.",
    });

    // if the QR code is scanned successfully, read the result
    if (status !== PlayStatus.success)
      throw new Error("Could not generate the QR code, please try again.");

    let urResult = await container.read([destinationDataType], {
      title: "Get the Signature from Keystone",
      description: "Please scan the QR code displayed on your Keystone",
      URTypeErrorMessage:
        "The scanned QR code can't be read. please verify and try again.",
    });

    // return the result if the QR code data(UR) of scanned successfully
    if (urResult.status !== ReadStatus.success)
      throw new Error("Could not extract the signature, please try again.");
    return urResult.result;
  };

/**
 * Generates the p2tr Bitcoin address from an extended public key and a path.
 * @param xpub - The extended public key.
 * @param path - The derivation path.
 * @param network - The Bitcoin network.
 * @returns The Bitcoin address and the public key as a hex string.
 */
const generateP2trAddressFromXpub = (
  xpub: string,
  path: string,
  network: BitcoinNetwork,
): { address: string; pubkeyHex: string; scriptPubKeyHex: string } => {
  const hdNode = HDKey.fromExtendedKey(xpub);
  const derivedNode = hdNode.derive(path);
  let pubkeyBuffer = Buffer.from(derivedNode.publicKey!);
  const childNodeXOnlyPubkey = toXOnly(pubkeyBuffer);
  const { address, output } = payments.p2tr({
    internalPubkey: childNodeXOnlyPubkey,
    network,
  });
  return {
    address: address!,
    pubkeyHex: pubkeyBuffer.toString("hex"),
    scriptPubKeyHex: output!.toString("hex"),
  };
};

/**
 * Calculates the tap leaf hashes for a given PsbtInput and public key.
 * @param input - The PsbtInput object.
 * @param pubkey - The public key as a Buffer.
 * @returns An array of tap leaf hashes.
 */
const caculateTapLeafHash = (input: PsbtInput, pubkey: Buffer) => {
  if (input.tapInternalKey && !input.tapLeafScript) {
    return [];
  }
  const tapLeafHashes = (input.tapLeafScript || [])
    .filter((tapLeaf) => pubkeyInScript(pubkey, tapLeaf.script))
    .map((tapLeaf) => {
      const hash = tapleafHash({
        output: tapLeaf.script,
        version: tapLeaf.leafVersion,
      });
      return Object.assign({ hash }, tapLeaf);
    });

  return tapLeafHashes.map((each) => each.hash);
};
