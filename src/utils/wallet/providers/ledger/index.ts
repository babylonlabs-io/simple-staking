"use client";

import TransportWebUSB from "@ledgerhq/hw-transport-webusb";
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
import { AppClient, DefaultWalletPolicy } from "ledger-bitcoin";

import { getNetworkConfig } from "@/config/network.config";

import { toNetwork } from "../..";
import {
  getAddressBalance,
  getFundingUTXOs,
  getNetworkFees,
  getTipHeight,
  pushTx,
} from "../../../mempool_api";
import {
  Fees,
  InscriptionIdentifier,
  Network,
  UTXO,
  WalletProvider,
} from "../../wallet_provider";

import BIP322 from "./bip322";

type LedgerWalletInfo = {
  app: AppClient;
  policy: DefaultWalletPolicy;
  mfp: string | undefined;
  extendedPublicKey: string | undefined;
  address: string | undefined;
  path: string | undefined;
  publicKeyHex: string | undefined;
  scriptPubKeyHex: string | undefined;
};

export class LedgerWallet extends WalletProvider {
  private ledgerWaleltInfo: LedgerWalletInfo | undefined;
  private networkEnv: Network | undefined;

  constructor() {
    super();
    this.networkEnv = getNetworkConfig().network;
  }

  connectWallet = async (): Promise<this> => {
    const transport = await TransportWebUSB.create();
    const app = new AppClient(transport);

    // ==> Get the master key fingerprint
    const fpr = await app.getMasterFingerprint();

    const taprootPath = "m/86'/0'/0'";

    // ==> Get and display on screen the first taproot address
    const firstTaprootAccountPubkey = await app.getExtendedPubkey(taprootPath);
    const firstTaprootAccountPolicy = new DefaultWalletPolicy(
      "tr(@0/**)",
      `[${fpr}/86'/0'/0']${firstTaprootAccountPubkey}`,
    );

    // const firstTaprootAccountAddress = await app.getWalletAddress(
    //   firstTaprootAccountPolicy,
    //   null,
    //   0,
    //   0,
    //   false,
    //   // true // show address on the wallet's screen
    // );

    this.ledgerWaleltInfo = {
      app,
      policy: firstTaprootAccountPolicy,
      mfp: fpr,
      extendedPublicKey: firstTaprootAccountPubkey,
      path: taprootPath,
      address: undefined,
      publicKeyHex: undefined,
      scriptPubKeyHex: undefined,
    };

    if (!this.ledgerWaleltInfo.extendedPublicKey)
      throw new Error("Could not retrieve the extended public key");

    // generate the address and public key based on the xpub
    const curentNetwork = await this.getNetwork();
    const { address, pubkeyHex, scriptPubKeyHex } = generateP2trAddressFromXpub(
      this.ledgerWaleltInfo.extendedPublicKey,
      "M/0/0",
      toNetwork(curentNetwork),
    );
    this.ledgerWaleltInfo.address = address;
    this.ledgerWaleltInfo.publicKeyHex = pubkeyHex;
    this.ledgerWaleltInfo.scriptPubKeyHex = scriptPubKeyHex;
    return this;
  };

  getWalletProviderName = async (): Promise<string> => {
    return "Ledger";
  };

  getAddress = async (): Promise<string> => {
    if (this.ledgerWaleltInfo?.address) {
      return this.ledgerWaleltInfo?.address;
    }
    throw new Error("Could not retrieve the address");
  };

  getPublicKeyHex = async (): Promise<string> => {
    if (this.ledgerWaleltInfo?.publicKeyHex) {
      return this.ledgerWaleltInfo?.publicKeyHex;
    }
    throw new Error("Could not retrieve the BTC public key");
  };

  signPsbt = async (psbtHex: string): Promise<string> => {
    // enhance the PSBT with the BIP32 derivation information
    // to tell keystone which key to use to sign the PSBT
    let psbt = Psbt.fromHex(psbtHex);
    console.log("psbt", psbt);
    psbt = this.enhancePsbt(psbt);
    console.log("psbt enhanced", psbt);
    let enhancedPsbt = psbt.toHex();
    console.log("enhancedPsbt", enhancedPsbt);
    // sign the psbt with keystone
    const signedPsbt = await this.signEnhancedPsbt(enhancedPsbt);
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

  signMessageBIP322 = async (message: string): Promise<string> => {
    // construct the psbt of Bip322 message signing
    const scriptPubKey = Buffer.from(
      this.ledgerWaleltInfo!.scriptPubKeyHex!,
      "hex",
    );
    const toSpendTx = BIP322.buildToSpendTx(message, scriptPubKey);
    const internalPublicKey = toXOnly(
      Buffer.from(this.ledgerWaleltInfo!.publicKeyHex!, "hex"),
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
    const signedPsbt = await this.signEnhancedPsbt(psbt.toHex());
    return BIP322.encodeWitness(signedPsbt);
  };

  /**
   * Sign the PSBT with the Keystone device.
   *
   * @param psbtHex - The PSBT in hex format.
   *  @returns The signed PSBT in hex format.
   * */
  private signEnhancedPsbt = async (psbtHex: string): Promise<Psbt> => {
    console.log("before result");
    const result = await this.ledgerWaleltInfo?.app.signPsbt(
      Buffer.from(psbtHex, "hex"),
      this.ledgerWaleltInfo?.policy,
      null,
    );
    console.log("after result");

    if (!result) {
      throw new Error("Could not sign the PSBT");
    }

    console.log("result", result);

    const originalPsbt = Psbt.fromHex(psbtHex);

    result.forEach((element: any) => {
      const index = element[0];
      const partialSignature = element[1];
      // Update the PSBT input with the partial signature
      originalPsbt.signInput(index, {
        publicKey: partialSignature.pubkey,
        sign: () => {
          return Buffer.concat([
            partialSignature.signature,
            Buffer.from([1]), // SIGHASH_ALL
          ]);
        },
        signSchnorr: () => {
          return partialSignature.signature;
        },
      });
    });

    // Finalize the PSBT
    const signedPsbt = originalPsbt.finalizeAllInputs();
    console.log("signedPsbt", signedPsbt);

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
      masterFingerprint: Buffer.from(this.ledgerWaleltInfo!.mfp!, "hex"),
      path: `${this.ledgerWaleltInfo!.path!}/0/0`,
      pubkey: Buffer.from(this.ledgerWaleltInfo!.publicKeyHex!, "hex"),
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
    // not implemented
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

  getInscriptions(): Promise<InscriptionIdentifier[]> {
    throw new Error("Method not implemented.");
  }
}

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
