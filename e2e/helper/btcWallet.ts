// required for mempool URL construction
import "core-js/web/url";

import * as ecc from "@bitcoin-js/tiny-secp256k1-asmjs";
import * as bip32 from "@scure/bip32";
import * as bip39 from "@scure/bip39";
import * as bitcoin from "bitcoinjs-lib";
import ECPairFactory from "ecpair";

import { getNetworkFees, getTipHeight } from "@/utils/mempool_api";
import { getPublicKeyNoCoord, isTaproot } from "@/utils/wallet";
import {
  Fees,
  InscriptionIdentifier,
  Network,
  UTXO,
  WalletProvider,
} from "@/utils/wallet/wallet_provider";

import { nativeSegwitMainnetUTXOs } from "../mock/mainnet/nativeSegwit/utxos";
import { taprootMainnetUTXOs } from "../mock/mainnet/taproot/utxos";
import { nativeSegwitSignetUTXOs } from "../mock/signet/nativeSegwit/utxos";
import { taprootSignetUTXOs } from "../mock/signet/taproot/utxos";

bitcoin.initEccLib(ecc);
const ECPair = ECPairFactory(ecc);

export class BTCWallet extends WalletProvider {
  private network: Network;
  private mnemonic: string;
  private seed: Uint8Array;
  private root: bip32.HDKey;
  private keyPair: bitcoin.Signer & { publicKey: Buffer };
  private tweakedKeyPair: bitcoin.Signer;
  private address: string;
  private publicKeyHex: string;

  constructor(
    mnemonic: string,
    network: Network,
    addressType: "taproot" | "segwit",
  ) {
    super();
    this.mnemonic = mnemonic;
    this.network = network;

    const bitcoinjsNetwork = this.getBitcoinJSNetwork(network);

    // Generate seed and root
    this.seed = bip39.mnemonicToSeedSync(this.mnemonic);
    this.root = bip32.HDKey.fromMasterSeed(this.seed);

    // Adjust the derivation path based on the network and address type
    let path =
      addressType === "taproot" ? "m/86'/0'/0'/0/0" : "m/84'/0'/0'/0/0"; // Taproot or NativeSegwit - Mainnet by default
    if (network === Network.TESTNET || network === Network.SIGNET) {
      path = addressType === "taproot" ? "m/86'/1'/0'/0/0" : "m/84'/1'/0'/0/0"; // Testnet and Signet derivation path
    }

    // Derive key pair
    const child = this.root.derive(path);

    if (!child.privateKey || !child.publicKey) {
      throw new Error("Private key or public key not available");
    }

    // Create ECPair from private key
    this.keyPair = ECPair.fromPrivateKey(Buffer.from(child.privateKey), {
      network: bitcoinjsNetwork,
    });

    // Tweak the signer for Taproot
    this.tweakedKeyPair = this.tweakSigner(this.keyPair, {
      network: bitcoinjsNetwork,
    });

    if (addressType === "taproot") {
      // Convert public key from Uint8Array to Buffer for Taproot
      const publicKeyBuffer = Buffer.from(child.publicKey);

      // Create the Taproot (P2TR) address
      const { address } = bitcoin.payments.p2tr({
        internalPubkey: publicKeyBuffer.subarray(1), // Remove the 0x02 or 0x03 prefix
        network: bitcoinjsNetwork,
      });

      if (!address) {
        throw new Error("Failed to generate Taproot address");
      }
      this.address = address;
    } else {
      // Create Native SegWit (P2WPKH) address
      const { address } = bitcoin.payments.p2wpkh({
        pubkey: this.keyPair.publicKey,
        network: bitcoinjsNetwork,
      });

      if (!address) {
        throw new Error("Failed to generate Native SegWit address");
      }
      this.address = address;
    }

    this.publicKeyHex = this.keyPair.publicKey.toString("hex");
  }

  async connectWallet(): Promise<this> {
    return this;
  }

  async getWalletProviderName(): Promise<string> {
    return "BTCWallet";
  }

  async getAddress(): Promise<string> {
    return this.address;
  }

  async getPublicKeyHex(): Promise<string> {
    return this.publicKeyHex;
  }

  async signPsbt(psbtHex: string): Promise<string> {
    const psbt = bitcoin.Psbt.fromHex(psbtHex, {
      network: this.getBitcoinJSNetwork(this.network),
    });
    if (isTaproot(this.address)) {
      // In case of Taproot staking requires the tweaked key pair
      try {
        psbt.signAllInputs(this.tweakedKeyPair);
      } catch (error) {
        psbt.signAllInputs(this.keyPair);
      }
    } else {
      psbt.signAllInputs(this.keyPair);
    }
    psbt.finalizeAllInputs();
    return psbt.toHex();
  }

  async signPsbts(psbtsHexes: string[]): Promise<string[]> {
    return Promise.all(psbtsHexes.map(this.signPsbt.bind(this)));
  }

  async signMessageBIP322(_message: string): Promise<string> {
    throw new Error("BIP322 signing not implemented");
  }

  async getNetwork(): Promise<Network> {
    return this.network;
  }

  on(_eventName: string, _callBack: () => void): void {}

  async getBalance(): Promise<number> {
    // Balance is not used as we derive from mock UTXOs
    return 0;
  }

  async getNetworkFees(): Promise<Fees> {
    return await getNetworkFees();
  }

  async pushTx(txHex: string): Promise<string> {
    return bitcoin.Transaction.fromHex(txHex).getId();
  }

  async getUtxos(address: string, _amount?: number): Promise<UTXO[]> {
    const isOnMainnet = this.network === Network.MAINNET;

    if (isTaproot(address)) {
      // Taproot Mainnet or Signet UTXOS
      return isOnMainnet ? taprootMainnetUTXOs : taprootSignetUTXOs;
    } else {
      // Native SegWit Mainnet or Signet UTXOs
      return isOnMainnet ? nativeSegwitMainnetUTXOs : nativeSegwitSignetUTXOs;
    }
  }

  async getBTCTipHeight(): Promise<number> {
    return await getTipHeight();
  }

  async getInscriptions(): Promise<InscriptionIdentifier[]> {
    return [];
  }

  private getBitcoinJSNetwork(network: Network): bitcoin.networks.Network {
    switch (network) {
      case Network.MAINNET:
        return bitcoin.networks.bitcoin;
      case Network.TESTNET:
        return bitcoin.networks.testnet;
      case Network.SIGNET:
        return bitcoin.networks.testnet;
      default:
        throw new Error("Unsupported network");
    }
  }

  private tweakSigner(signer: bitcoin.Signer, opts: any = {}): bitcoin.Signer {
    // @ts-ignore
    let privateKey: Uint8Array | undefined = signer.privateKey!;
    if (!privateKey) {
      throw new Error("Private key is required for tweaking signer!");
    }
    if (signer.publicKey[0] === 3) {
      privateKey = ecc.privateNegate(privateKey);
    }

    const tweakedPrivateKey = ecc.privateAdd(
      privateKey,
      this.tapTweakHash(
        getPublicKeyNoCoord(signer.publicKey.toString("hex")),
        opts.tweakHash,
      ),
    );
    if (!tweakedPrivateKey) {
      throw new Error("Invalid tweaked private key!");
    }

    return ECPair.fromPrivateKey(Buffer.from(tweakedPrivateKey), {
      network: opts.network,
    });
  }

  private tapTweakHash(pubKey: Buffer, h: Buffer | undefined): Uint8Array {
    return bitcoin.crypto.taggedHash(
      "TapTweak",
      Buffer.concat(h ? [pubKey, h] : [pubKey]),
    );
  }
}
