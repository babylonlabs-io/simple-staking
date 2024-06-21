import * as ecc from "@bitcoin-js/tiny-secp256k1-asmjs";
import * as bitcoin from "bitcoinjs-lib";
import { StakingScriptData, StakingScripts } from "btc-staking-ts";
import ECPairFactory from "ecpair";

import { GlobalParamsVersion } from "@/app/types/globalParams";
import { UTXO } from "@/utils/wallet/wallet_provider";

// Initialize the ECC library
bitcoin.initEccLib(ecc);
const ECPair = ECPairFactory(ecc);

export class DataGenerator {
  private network: bitcoin.networks.Network;

  constructor(network: bitcoin.networks.Network) {
    this.network = network;
  }

  generateRandomTxId = () => {
    const randomBuffer = Buffer.alloc(32);
    for (let i = 0; i < 32; i++) {
      randomBuffer[i] = Math.floor(Math.random() * 256);
    }
    return randomBuffer.toString("hex");
  };

  generateRandomKeyPair = (isNoCoordPk = true) => {
    const keyPair = ECPair.makeRandom({ network: this.network });
    const { privateKey, publicKey } = keyPair;
    if (!privateKey || !publicKey) {
      throw new Error("Failed to generate random key pair");
    }
    let pk = publicKey.toString("hex");

    pk = isNoCoordPk ? pk.slice(2) : pk;

    return {
      privateKey: privateKey.toString("hex"),
      publicKey: pk,
    };
  };

  // Generate a random staking term (number of blocks to stake)
  // ranged from 1 to 65535
  generateRandomStakingTerm = () => {
    return Math.floor(Math.random() * 65535) + 1;
  };

  generateRandomUnbondingTime = (stakingTerm: number) => {
    return Math.floor(Math.random() * stakingTerm) + 1;
  };

  generateRandomFeeRates = () => {
    return Math.floor(Math.random() * 1000) + 1;
  };

  // Convenant committee are a list of public keys that are used to sign a covenant
  generateRandomCovenantCommittee = (size: number): Buffer[] => {
    const committe: Buffer[] = [];
    for (let i = 0; i < size; i++) {
      // covenant committee PKs are with coordiantes
      const keyPair = this.generateRandomKeyPair(false);
      committe.push(Buffer.from(keyPair.publicKey, "hex"));
    }
    return committe;
  };

  generateRandomTag = () => {
    const buffer = Buffer.alloc(4);
    for (let i = 0; i < 4; i++) {
      buffer[i] = Math.floor(Math.random() * 256);
    }
    return buffer;
  };

  // Generate a single global param
  generateRandomGlobalParams = (isFixedTimelock = false) => {
    const stakingTerm = this.generateRandomStakingTerm();
    const committeeSize = Math.floor(Math.random() * 20) + 5;
    const covenantPks = this.generateRandomCovenantCommittee(committeeSize).map(
      (buffer) => buffer.toString("hex"),
    );
    const covenantQuorum = Math.floor(Math.random() * (committeeSize - 1)) + 1;
    const unbondingTime = this.generateRandomUnbondingTime(stakingTerm);
    const tag = this.generateRandomTag().toString("hex");

    let minStakingTimeBlocks = Math.floor(Math.random() * 100);
    let maxStakingTimeBlocks =
      minStakingTimeBlocks + Math.floor(Math.random() * 1000);
    if (isFixedTimelock) {
      maxStakingTimeBlocks = minStakingTimeBlocks;
    }

    const minStakingAmountSat = Math.floor(Math.random() * 100);
    const maxStakingAmountSat =
      minStakingAmountSat + Math.floor(Math.random() * 1000);

    return {
      version: Math.floor(Math.random() * 100),
      activationHeight: Math.floor(Math.random() * 100),
      stakingCapSat: Math.floor(Math.random() * 100),
      stakingCapHeight: Math.floor(Math.random() * 100),
      covenantPks,
      covenantQuorum,
      unbondingFeeSat: Math.floor(Math.random() * 1000),
      maxStakingAmountSat,
      minStakingAmountSat,
      maxStakingTimeBlocks,
      minStakingTimeBlocks,
      confirmationDepth: Math.floor(Math.random() * 20),
      unbondingTime,
      tag,
    };
  };

  getTaprootAddress = (publicKey: string) => {
    // Remove the prefix if it exists
    if (publicKey.length == 66) {
      publicKey = publicKey.slice(2);
    }
    const internalPubkey = Buffer.from(publicKey, "hex");
    const { address } = bitcoin.payments.p2tr({
      internalPubkey,
      network: this.network,
    });
    if (!address) {
      throw new Error("Failed to generate taproot address from public key");
    }
    return address;
  };

  getNativeSegwitAddress = (publicKey: string) => {
    const internalPubkey = Buffer.from(publicKey, "hex");
    const { address } = bitcoin.payments.p2wpkh({
      pubkey: internalPubkey,
      network: this.network,
    });
    if (!address) {
      throw new Error(
        "Failed to generate native segwit address from public key",
      );
    }
    return address;
  };

  getNetwork = () => {
    return this.network;
  };

  generateMockStakingScripts = (
    globalParams: GlobalParamsVersion,
    publicKeyNoCoord: string,
    finalityProviderPk: string,
    stakingTxTimelock: number,
  ): StakingScripts => {
    // Convert covenant PKs to buffers
    const covenantPKsBuffer = globalParams.covenantPks.map((pk: string) =>
      Buffer.from(pk, "hex"),
    );

    // Create staking script data
    let stakingScriptData;
    try {
      stakingScriptData = new StakingScriptData(
        Buffer.from(publicKeyNoCoord, "hex"),
        [Buffer.from(finalityProviderPk, "hex")],
        covenantPKsBuffer,
        globalParams.covenantQuorum,
        stakingTxTimelock,
        globalParams.unbondingTime,
        Buffer.from(globalParams.tag, "hex"),
      );
    } catch (error: Error | any) {
      throw new Error(error?.message || "Cannot build staking script data");
    }

    // Build scripts
    let scripts;
    try {
      scripts = stakingScriptData.buildScripts();
    } catch (error: Error | any) {
      throw new Error(error?.message || "Error while recreating scripts");
    }

    return scripts;
  };

  generateRandomUTXOs = (
    minAvailableBalance: number,
    numberOfUTXOs: number,
  ): UTXO[] => {
    const utxos = [];
    let sum = 0;
    for (let i = 0; i < numberOfUTXOs; i++) {
      utxos.push({
        txid: this.generateRandomTxId(),
        vout: Math.floor(Math.random() * 10),
        scriptPubKey: this.generateRandomKeyPair().publicKey,
        value: Math.floor(Math.random() * 9000) + minAvailableBalance,
      });
      sum += utxos[i].value;
      if (sum >= minAvailableBalance) {
        break;
      }
    }
    return utxos;
  };
  /**
   * Generates a random integer between min and max.
   *
   * @param {number} min - The minimum number.
   * @param {number} max - The maximum number.
   * @returns {number} - A random integer between min and max.
   */
  getRandomIntegerBetween = (min: number, max: number): number => {
    if (min > max) {
      throw new Error(
        "The minimum number should be less than or equal to the maximum number.",
      );
    }
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };
}
