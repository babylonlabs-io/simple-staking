import * as ecc from "@bitcoin-js/tiny-secp256k1-asmjs";
import * as bitcoin from "bitcoinjs-lib";
import ECPairFactory from "ecpair";

import { UTXO } from "@/utils/wallet/wallet_provider";
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

  generateRandomKeyPairs = (isNoCoordPk = false) => {
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

  generateRandomFeeRates = () => {
    return Math.floor(Math.random() * 1000) + 1;
  };

  // Convenant quorums are a list of public keys that are used to sign a covenant
  generateRandomCovenantCommittee = (size: number): Buffer[] => {
    const quorum: Buffer[] = [];
    for (let i = 0; i < size; i++) {
      const keyPair = this.generateRandomKeyPairs(true);
      quorum.push(Buffer.from(keyPair.publicKey, "hex"));
    }
    return quorum;
  };

  generateRandomTag = () => {
    const buffer = Buffer.alloc(4);
    for (let i = 0; i < 4; i++) {
      buffer[i] = Math.floor(Math.random() * 256);
    }
    return buffer;
  };

  generateRandomGlobalParams = (isFixedTimelock = false) => {
    // the commitee size is assunmed to be between 5 and 20
    const committeeSize = Math.floor(Math.random() * 20) + 5;
    const covenantPks = this.generateRandomCovenantCommittee(committeeSize).map(
      (buffer) => buffer.toString("hex"),
    );
    // the covenantQuorum should always be around 2/3 of the committee size
    const covenantQuorum = Math.floor((committeeSize * 2) / 3);
    let maxStakingTimeBlocks = Math.floor(Math.random() * 100);
    let minStakingTimeBlocks = Math.floor(Math.random() * 100);
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
      tag: this.generateRandomTag().toString("hex"),
      covenantPks,
      covenantQuorum,
      unbondingTime: this.generateRandomStakingTerm(),
      unbondingFeeSat: Math.floor(Math.random() * 1000),
      maxStakingAmountSat,
      minStakingAmountSat,
      maxStakingTimeBlocks,
      minStakingTimeBlocks,
      confirmationDepth: Math.floor(Math.random() * 20),
    };
  };

  getTaprootAddress = (publicKey: string) => {
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

  //   generateMockStakingScripts = (): StakingScripts => {
  //     const finalityProviderPk = this.generateRandomKeyPairs(true).publicKey;
  //     const stakingTxTimelock = this.generateRandomStakingTerm();
  //     const publicKeyNoCoord = this.generateRandomKeyPairs(true).publicKey;
  //     const globalParams = this.generateRandomGlobalParams();

  //     // Convert covenant PKs to buffers
  //     const covenantPKsBuffer = globalParams.covenantPks.map((pk) =>
  //       Buffer.from(pk, "hex"),
  //     );

  //     // Create staking script data
  //     let stakingScriptData;
  //     try {
  //       stakingScriptData = new StakingScriptData(
  //         Buffer.from(publicKeyNoCoord, "hex"),
  //         [Buffer.from(finalityProviderPk, "hex")],
  //         covenantPKsBuffer,
  //         globalParams.covenantQuorum,
  //         stakingTxTimelock,
  //         globalParams.unbondingTime,
  //         Buffer.from(globalParams.tag, "hex"),
  //       );
  //     } catch (error: Error | any) {
  //       throw new Error(error?.message || "Cannot build staking script data");
  //     }

  //     // Build scripts
  //     let scripts;
  //     try {
  //       scripts = stakingScriptData.buildScripts();
  //     } catch (error: Error | any) {
  //       throw new Error(error?.message || "Error while recreating scripts");
  //     }

  //     return scripts;
  //   };

  generateRandomUTXOs = (
    dataGenerator: DataGenerator,
    numUTXOs: number,
  ): UTXO[] => {
    return Array.from({ length: numUTXOs }, () => ({
      txid: dataGenerator.generateRandomTxId(),
      vout: Math.floor(Math.random() * 10),
      scriptPubKey: this.generateRandomKeyPairs().publicKey,
      value: Math.floor(Math.random() * 9000) + 1000,
    }));
  };
}
