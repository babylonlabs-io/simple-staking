import {
  initEccLib,
  script,
  payments,
  Psbt,
  opcodes,
  networks,
} from "bitcoinjs-lib";
import { Taptree } from "bitcoinjs-lib/src/types";
import ecc from "@bitcoinerlab/secp256k1";

// internalPubKey denotes an unspendable internal public key to be used for the taproot output
const internalPubKey = Buffer.from(
  "0250929b74c1a04954b78b4b6035e97a5e078a5a0f28ec96d547bfee9ace803ac0",
  "hex",
).subarray(1, 33); // Do a subarray(1, 33) to get the public coordinate

// UTXO is a structure defining attributes for a UTXO
export interface UTXO {
  txid: string;
  vout: number;
  value: number;
  scriptPubKey: String;
}

export function initBTCCurve() {
  // Initialize elliptic curve library
  initEccLib(ecc);
}

// StakingScriptData is a class that holds the data required for the BTC Staking Script
// and exposes methods for converting it into useful formats
export class StakingScriptData {
  stakerKey: Buffer;
  finalityProviderKeys: Buffer[];
  covenantKeys: Buffer[];
  covenantThreshold: number;
  stakingTime: number;
  unbondingTime: number;

  constructor(
    stakerKey: Buffer,
    finalityProviderKeys: Buffer[],
    covenantKeys: Buffer[],
    covenantThreshold: number,
    stakingTime: number,
    unbondingTime: number,
  ) {
    this.stakerKey = stakerKey;
    this.finalityProviderKeys = finalityProviderKeys;
    this.covenantKeys = covenantKeys;
    this.covenantThreshold = covenantThreshold;
    this.stakingTime = stakingTime;
    this.unbondingTime = unbondingTime;
  }

  validate(): boolean {
    // pubKeyLength denotes the length of a public key in bytes
    const pubKeyLength = 32;
    // check that staker key is the correct length
    if (this.stakerKey.length != pubKeyLength) {
      return false;
    }
    // check that finalityProvider keys are the correct length
    if (
      this.finalityProviderKeys.some(
        (finalityProviderKey) => finalityProviderKey.length != pubKeyLength,
      )
    ) {
      return false;
    }
    // check that covenant keys are the correct length
    if (
      this.covenantKeys.some(
        (covenantKey) => covenantKey.length != pubKeyLength,
      )
    ) {
      return false;
    }
    // check that maximum value for staking time is not greater than uint16
    if (this.stakingTime > 65535) {
      return false;
    }
    return true;
  }

  // The staking script allows for multiple finality provider public keys
  // to support (re)stake to multiple finality providers
  // Covenant members are going to have multiple keys

  // Only holder of private key for given pubKey can spend after relative lock time
  // Creates the timelock script in the form:
  // <stakerPubKey>
  // OP_CHECKSIGVERIFY
  // <stakingTimeBlocks>
  // OP_CHECKSEQUENCEVERIFY
  buildTimelockScript(): Buffer {
    return script.compile([
      this.stakerKey,
      opcodes.OP_CHECKSIGVERIFY,
      script.number.encode(this.stakingTime),
      opcodes.OP_CHECKSEQUENCEVERIFY,
    ]);
  }

  // Creates the unbonding timelock script in the form:
  // <stakerPubKey>
  // OP_CHECKSIGVERIFY
  // <unbondingTimeBlocks>
  // OP_CHECKSEQUENCEVERIFY
  buildUnbondingTimelockScript(): Buffer {
    return script.compile([
      this.stakerKey,
      opcodes.OP_CHECKSIGVERIFY,
      script.number.encode(this.unbondingTime),
      opcodes.OP_CHECKSEQUENCEVERIFY,
    ]);
  }

  // Creates the unbonding script of the form:
  // buildSingleKeyScript(stakerPk, true) ||
  // buildMultiKeyScript(covenantPks, covenantThreshold, false)
  // || means combining the scripts
  buildUnbondingScript(): Buffer {
    return Buffer.concat([
      this.buildSingleKeyScript(this.stakerKey, true),
      this.buildMultiKeyScript(
        this.covenantKeys,
        this.covenantThreshold,
        false,
      ),
    ]);
  }

  // Creates the slashing script of the form:
  // buildSingleKeyScript(stakerPk, true) ||
  // buildMultiKeyScript(finalityProviderPKs, 1, true) ||
  // buildMultiKeyScript(covenantPks, covenantThreshold, false)
  // || means combining the scripts
  buildSlashingScript(): Buffer {
    return Buffer.concat([
      this.buildSingleKeyScript(this.stakerKey, true),
      this.buildMultiKeyScript(
        this.finalityProviderKeys,
        // The threshold is always 1 as we only need one
        // finalityProvider signature to perform slashing
        // (only one finalityProvider performs an offence)
        1,
        // OP_VERIFY/OP_CHECKSIGVERIFY is added at the end
        true,
      ),
      this.buildMultiKeyScript(
        this.covenantKeys,
        this.covenantThreshold,
        // No need to add verify since covenants are at the end of the script
        false,
      ),
    ]);
  }

  // buildScripts creates the timelock, unbonding and slashing scripts
  buildScripts(): {
    timelockScript: Buffer;
    unbondingScript: Buffer;
    slashingScript: Buffer;
    unbondingTimelockScript: Buffer;
  } {
    return {
      timelockScript: this.buildTimelockScript(),
      unbondingScript: this.buildUnbondingScript(),
      slashingScript: this.buildSlashingScript(),
      unbondingTimelockScript: this.buildUnbondingTimelockScript(),
    };
  }

  // buildSingleKeyScript and buildMultiKeyScript allow us to reuse functionality
  // for creating Bitcoin scripts for the unbonding script and the slashing script

  // buildSingleKeyScript creates a single key script
  // Only holder of private key for given pubKey can spend
  // Creates a script of the form:
  // <pk> OP_CHECKSIGVERIFY (if withVerify is true)
  // <pk> OP_CHECKSIG (if withVerify is false)
  buildSingleKeyScript(pk: Buffer, withVerify: boolean): Buffer {
    return script.compile([
      pk,
      withVerify ? opcodes.OP_CHECKSIGVERIFY : opcodes.OP_CHECKSIG,
    ]);
  }

  // buildMultiSigScript creates a multi key script
  // It validates whether provided keys are unique and the threshold is not greater than number of keys
  // If there is only one key provided it will return single key sig script
  // Creates a script of the form:
  // <pk1> OP_CHEKCSIG <pk2> OP_CHECKSIGADD <pk3> OP_CHECKSIGADD ... <pkN> OP_CHECKSIGADD <threshold> OP_GREATERTHANOREQUAL
  // <withVerify -> OP_VERIFY>
  buildMultiKeyScript(
    pks: Buffer[],
    threshold: number,
    withVerify: boolean,
  ): Buffer {
    // Verify that pks is not empty
    if (!pks || pks.length === 0) {
      throw new Error("No keys provided");
    }
    // Verify that threshold <= len(pks)
    if (threshold > pks.length) {
      throw new Error(
        "Required number of valid signers is greater than number of provided keys",
      );
    }
    if (pks.length === 1) {
      return this.buildSingleKeyScript(pks[0], withVerify);
    }
    // keys must be sorted
    const sortedPks = pks.sort(Buffer.compare);
    // verify there are no duplicates
    for (let i = 0; i < sortedPks.length - 1; ++i) {
      if (sortedPks[i].equals(sortedPks[i + 1])) {
        throw new Error("Duplicate keys provided");
      }
    }
    const scriptElements = [sortedPks[0], opcodes.OP_CHECKSIG];
    for (let i = 1; i < sortedPks.length; i++) {
      scriptElements.push(sortedPks[i]);
      scriptElements.push(opcodes.OP_CHECKSIGADD);
    }
    scriptElements.push(script.number.encode(threshold));
    scriptElements.push(opcodes.OP_GREATERTHANOREQUAL);
    if (withVerify) {
      scriptElements.push(opcodes.OP_VERIFY);
    }
    return script.compile(scriptElements);
  }
}

// stakingTransaction constructs a BTC Staking transaction
// - Inputs: The set of UTXOs provided as an argument
// - Outputs:
//   - The first one corresponds to the staking script with a certain amount
//   - The second one corresponds to the change from spending the amount and the transaction fee
export function stakingTransaction(
  timelockScript: Buffer,
  unbondingScript: Buffer,
  slashingScript: Buffer,
  amount: number,
  fee: number,
  changeAddress: string,
  inputUTXOs: UTXO[],
  network: networks.Network,
  publicKeyNoCoord?: Buffer,
): Psbt {
  // - Sum of inputs is more than the staking amount + the fee
  // - The change address is a valid address
  // - The amount and fee are more than 0

  // Create a partially signed transaction
  const psbt = new Psbt({ network });
  // Add the UTXOs provided as inputs to the transaction
  var inputsSum = 0;
  for (var i = 0; i < inputUTXOs.length; ++i) {
    const input = inputUTXOs[i];
    psbt.addInput({
      hash: input.txid,
      index: input.vout,
      witnessUtxo: {
        script: Buffer.from(input.scriptPubKey, "hex"),
        value: input.value,
      },
      // this is needed only if the wallet is in taproot mode
      ...(publicKeyNoCoord && { tapInternalKey: publicKeyNoCoord }),
    });
    inputsSum += input.value;
  }

  const scriptTree: Taptree = [
    {
      output: slashingScript,
    },
    [{ output: unbondingScript }, { output: timelockScript }],
  ];

  // Create an pay-2-taproot (p2tr) output using the staking script
  const stakingOutput = payments.p2tr({
    internalPubkey: internalPubKey,
    scriptTree,
    network,
  });
  psbt.addOutput({
    address: stakingOutput.address!,
    value: amount,
  });
  // Add a change output only if there's any amount leftover from the inputs
  if (inputsSum > amount + fee) {
    psbt.addOutput({
      address: changeAddress,
      value: inputsSum - (amount + fee),
    });
  }

  return psbt;
}
