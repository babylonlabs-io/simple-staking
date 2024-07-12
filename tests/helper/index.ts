import * as ecc from "@bitcoin-js/tiny-secp256k1-asmjs";
import * as bitcoin from "bitcoinjs-lib";
import { StakingScriptData, StakingScripts } from "btc-staking-ts";
import ECPairFactory from "ecpair";

import { GlobalParamsVersion } from "@/app/types/globalParams";
import { createStakingTx } from "@/utils/delegations/signStakingTx";
import { getCurrentGlobalParamsVersion } from "@/utils/globalParams";
import { UTXO } from "@/utils/wallet/wallet_provider";

// Initialize the ECC library
bitcoin.initEccLib(ecc);
const ECPair = ECPairFactory(ecc);

export const DEFAULT_TEST_FEE_RATE = 10;
export const COMPRESSED_PUBLIC_KEY_HEX_LENGTH = 66;

export interface KeyPairs {
  keyPair: bitcoin.Signer;
  publicKey: string;
  noCoordPublicKey: string;
}

export class DataGenerator {
  private network: bitcoin.networks.Network;

  constructor(network: bitcoin.networks.Network) {
    this.network = network;
  }

  generateRandomString = (length: number): string => {
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  };

  generateRandomTxId = () => {
    const randomBuffer = Buffer.alloc(32);
    for (let i = 0; i < 32; i++) {
      randomBuffer[i] = Math.floor(Math.random() * 256);
    }
    return randomBuffer.toString("hex");
  };

  generateRandomKeyPair = (): KeyPairs => {
    const keyPair = ECPair.makeRandom({ network: this.network });
    const { privateKey, publicKey } = keyPair;
    if (!privateKey || !publicKey) {
      throw new Error("Failed to generate random key pair");
    }
    let pk = publicKey.toString("hex");
    return {
      keyPair,
      publicKey: pk,
      noCoordPublicKey: pk.slice(2),
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
      const keyPair = this.generateRandomKeyPair();
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
  generateRandomGlobalParams = (
    isFixedTimelock = false,
    previousPram: GlobalParamsVersion | undefined = undefined,
  ) => {
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

    const minStakingAmountSat = this.getRandomIntegerBetween(10000, 100000);
    const maxStakingAmountSat = this.getRandomIntegerBetween(
      minStakingAmountSat,
      100000000,
    );

    const defaultParams = {
      version: 0,
      activationHeight: 0,
      stakingCapSat: 0,
      stakingCapHeight: 0,
      covenantPks: covenantPks,
      covenantQuorum: covenantQuorum,
    };
    const prev = previousPram ? previousPram : defaultParams;

    return {
      version: prev.version + 1,
      activationHeight:
        prev.activationHeight + this.getRandomIntegerBetween(0, 10000),
      stakingCapSat:
        prev.stakingCapSat + this.getRandomIntegerBetween(0, 10000),
      stakingCapHeight:
        prev.stakingCapHeight + Math.floor(Math.random() * 10000),
      covenantPks: prev.covenantPks,
      covenantQuorum: prev.covenantQuorum,
      unbondingFeeSat: this.getRandomIntegerBetween(0, 100),
      maxStakingAmountSat,
      minStakingAmountSat,
      maxStakingTimeBlocks,
      minStakingTimeBlocks,
      confirmationDepth: this.getRandomIntegerBetween(1, 20),
      unbondingTime,
      tag,
    };
  };

  // Generate a list of global params
  generateGlobalPramsVersions = (
    numVersions: number,
  ): GlobalParamsVersion[] => {
    let versions = [];
    let lastVersion;
    for (let i = 0; i < numVersions; i++) {
      const isFixedTimelock = Math.random() > 0.5;
      versions.push(
        this.generateRandomGlobalParams(isFixedTimelock, lastVersion),
      );
      lastVersion = versions[i];
    }
    return versions;
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
    scriptPubKey: string,
  ): UTXO[] => {
    const utxos = [];
    let sum = 0;
    for (let i = 0; i < numberOfUTXOs; i++) {
      utxos.push({
        txid: this.generateRandomTxId(),
        vout: Math.floor(Math.random() * 10),
        scriptPubKey: scriptPubKey,
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

  getAddressAndScriptPubKey = (publicKey: string) => {
    return {
      taproot: this.getTaprootAddress(publicKey),
      nativeSegwit: this.getNativeSegwitAddress(publicKey),
    };
  };

  createRandomStakingPsbt = (
    globalParams: GlobalParamsVersion[],
    txHeight: number,
    stakerKeysPairs?: KeyPairs,
  ) => {
    const { currentVersion: selectedParam } = getCurrentGlobalParamsVersion(
      txHeight,
      globalParams,
    );
    if (!selectedParam) {
      throw new Error("Current version not found");
    }
    const stakerKeys = stakerKeysPairs
      ? stakerKeysPairs
      : this.generateRandomKeyPair();
    const { scriptPubKey, address } = this.getAddressAndScriptPubKey(
      stakerKeys.publicKey,
    ).nativeSegwit;
    const stakingAmount = this.getRandomIntegerBetween(
      selectedParam.minStakingAmountSat,
      selectedParam.maxStakingAmountSat,
    );
    const stakingTerm = this.getRandomIntegerBetween(
      selectedParam.minStakingTimeBlocks,
      selectedParam.maxStakingTimeBlocks,
    );
    const { unsignedStakingPsbt } = createStakingTx(
      selectedParam,
      stakingAmount,
      stakingTerm,
      this.generateRandomKeyPair().noCoordPublicKey, // FP key
      this.network,
      address,
      stakerKeys.noCoordPublicKey, // staker public key
      DEFAULT_TEST_FEE_RATE,
      this.generateRandomUTXOs(
        stakingAmount + 1000000, // add some extra satoshis to cover the fee
        this.getRandomIntegerBetween(1, 10),
        scriptPubKey,
      ),
    );

    const unsignedPsbt = unsignedStakingPsbt;

    const signedPsbt = unsignedStakingPsbt
      .signAllInputs(stakerKeys.keyPair)
      .finalizeAllInputs();

    return {
      unsignedPsbt,
      signedPsbt,
    };
  };

  private getTaprootAddress = (publicKey: string) => {
    // Remove the prefix if it exists
    if (publicKey.length == COMPRESSED_PUBLIC_KEY_HEX_LENGTH) {
      publicKey = publicKey.slice(2);
    }
    const internalPubkey = Buffer.from(publicKey, "hex");
    const { address, output: scriptPubKey } = bitcoin.payments.p2tr({
      internalPubkey,
      network: this.network,
    });
    if (!address || !scriptPubKey) {
      throw new Error(
        "Failed to generate taproot address or script from public key",
      );
    }
    return {
      address,
      scriptPubKey: scriptPubKey.toString("hex"),
    };
  };

  private getNativeSegwitAddress = (publicKey: string) => {
    if (publicKey.length != COMPRESSED_PUBLIC_KEY_HEX_LENGTH) {
      throw new Error(
        "Invalid public key length for generating native segwit address",
      );
    }
    const internalPubkey = Buffer.from(publicKey, "hex");
    const { address, output: scriptPubKey } = bitcoin.payments.p2wpkh({
      pubkey: internalPubkey,
      network: this.network,
    });
    if (!address || !scriptPubKey) {
      throw new Error(
        "Failed to generate native segwit address or script from public key",
      );
    }
    return {
      address,
      scriptPubKey: scriptPubKey.toString("hex"),
    };
  };
}

export const testingNetworks = [
  {
    networkName: "mainnet",
    network: bitcoin.networks.bitcoin,
    dataGenerator: new DataGenerator(bitcoin.networks.bitcoin),
  },
  {
    networkName: "testnet",
    network: bitcoin.networks.testnet,
    dataGenerator: new DataGenerator(bitcoin.networks.testnet),
  },
];
