import { btcstakingtx } from "@babylonlabs-io/babylon-proto-ts";
import {
  BTCSigType,
  ProofOfPossessionBTC,
} from "@babylonlabs-io/babylon-proto-ts/dist/generated/babylon/btcstaking/v1/pop";
import {
  StakerInfo,
  Staking,
  StakingParams,
  UTXO,
} from "@babylonlabs-io/btc-staking-ts";
import { fromBech32 } from "@cosmjs/encoding";
import { networks, Psbt, Transaction } from "bitcoinjs-lib";
import { useCallback } from "react";

import { useBTCWallet } from "@/app/context/wallet/BTCWalletProvider";
import { useCosmosWallet } from "@/app/context/wallet/CosmosWalletProvider";

export interface BtcStakingInputs {
  btcNetwork: networks.Network;
  stakerInfo: StakerInfo;
  stakerAddress: string;
  stakerNocoordPk: string;
  finalityProviderPublicKey: string;
  stakingAmountSat: number;
  stakingTimeBlocks: number;
  inputUTXOs: UTXO[];
  feeRate: number;
  params: StakingParams;
}

export enum StakingStep {
  Staking = "staking",
  Unbonding = "unbonding",
  StakingOutputSlashing = "staking-output-slashing",
  UnbondingOutputSlashing = "unbonding-output-slashing",
  ProofOfPossession = "proof-of-possession",
  SubmitBbnTx = "submit-bbn-tx",
}

export const useCreateBtcDelegation = () => {
  const { connected, bech32Address, getSigningStargateClient } =
    useCosmosWallet();
  const { signPsbt, signMessageBIP322, getPublicKeyHex, publicKeyNoCoord } =
    useBTCWallet();

  const createBtcDelegation = useCallback(
    async (btcInput: BtcStakingInputs) => {
      const staking = new Staking(
        btcInput.btcNetwork,
        btcInput.stakerInfo,
        btcInput.params,
        btcInput.finalityProviderPublicKey,
        btcInput.stakingTimeBlocks,
      );

      try {
        // Create Proof of Possession
        const bech32AddressHex = uint8ArrayToHex(
          fromBech32(bech32Address).data,
        );
        const signedBbnAddress =
          await window.okxwallet.bitcoinSignet.signMessage(
            bech32AddressHex,
            "ecdsa",
          );
        const ecdsaSig = Uint8Array.from(
          globalThis.Buffer.from(signedBbnAddress, "base64"),
        );
        const proofOfPossession: ProofOfPossessionBTC = {
          btcSigType: BTCSigType.ECDSA,
          btcSig: ecdsaSig,
        };
        // Create and sign staking transaction
        const { psbt: stakingPsbt } = staking.createStakingTransaction(
          btcInput.stakingAmountSat,
          btcInput.inputUTXOs,
          btcInput.feeRate,
        );
        const signedStakingPsbtHex = await signPsbt(stakingPsbt.toHex());
        const stakingTx =
          Psbt.fromHex(signedStakingPsbtHex).extractTransaction();

        // Create and sign unbonding transaction
        const { psbt: unbondingPsbt } =
          staking.createUnbondingTransaction(stakingTx);
        const signedUnbondingPsbtHex = await signPsbt(unbondingPsbt.toHex());
        const unbondingTx = Psbt.fromHex(
          signedUnbondingPsbtHex,
        ).extractTransaction();

        // Create slashing transactions and extract signatures
        const { psbt: slashingPsbt } =
          staking.createStakingOutputSlashingTransaction(stakingTx);
        const signedSlashingPsbtHex = await signPsbt(slashingPsbt.toHex());
        const signedSlashingTx = Psbt.fromHex(
          signedSlashingPsbtHex,
        ).extractTransaction();
        const stakingOutputSignatures =
          extractSchnorrSignaturesFromTransaction(signedSlashingTx);

        if (!stakingOutputSignatures) {
          throw new Error(
            "No signature found in the staking output slashing PSBT",
          );
        }

        const { psbt: unbondingSlashingPsbt } =
          staking.createUnbondingOutputSlashingTransaction(unbondingTx);
        const signedUnbondingSlashingPsbtHex = await signPsbt(
          unbondingSlashingPsbt.toHex(),
        );
        const signedUnbondingSlashingTx = Psbt.fromHex(
          signedUnbondingSlashingPsbtHex,
        ).extractTransaction();
        const unbondingSignatures = extractSchnorrSignaturesFromTransaction(
          signedUnbondingSlashingTx,
        );

        if (!unbondingSignatures) {
          throw new Error(
            "No signature found in the unbonding output slashing PSBT",
          );
        }

        // // Create Proof of Possession
        // const addrBytes = fromBech32(bech32Address).data;
        // const hashedMessage = createHash("sha256")
        //   .update(addrBytes)
        //   .digest("hex");
        // const signedBbnAddress = await signMessageBIP322(
        //   // hashedMessage.toString("hex"),
        //   hashedMessage,
        // );

        // // Build the BIP322 format data
        // const btcPk = await getPublicKeyHex();
        // const { address: btcAddress } = payments.p2wpkh({
        //   pubkey: Buffer.from(btcPk, "hex"),
        //   network: btcInput.btcNetwork,
        // });
        // // Construct the BIP322Sig message using `fromPartial`
        // console.log("btc pk", btcPk);
        // // console.log("publicKeyNoCoord", publicKeyNoCoord);
        // console.log("bech32Address", bech32Address);
        // console.log("prefix: ", fromBech32(bech32Address).prefix);
        // console.log("address", btcAddress);
        // console.log("sig", signedBbnAddress);

        // const bip322SigMessage: BIP322Sig = BIP322Sig.fromJSON({
        //   address: btcAddress!,
        //   sig: signedBbnAddress,
        // });
        // // Encode to Uint8Array
        // const btcSigBytes = BIP322Sig.encode(bip322SigMessage).finish();
        // console.log("btcSigBytes", uint8ArrayToBase64(btcSigBytes));
        // const proofOfPossession: ProofOfPossessionBTC = {
        //   btcSigType: BTCSigType.BIP322,
        //   btcSig: btcSigBytes,
        // };

        // Prepare and send protobuf message
        const msg: btcstakingtx.MsgCreateBTCDelegation = {
          stakerAddr: bech32Address,
          pop: proofOfPossession,
          btcPk: Uint8Array.from(Buffer.from(btcInput.stakerNocoordPk, "hex")),
          fpBtcPkList: [
            Uint8Array.from(
              Buffer.from(btcInput.finalityProviderPublicKey, "hex"),
            ),
          ],
          stakingTime: btcInput.stakingTimeBlocks,
          stakingValue: btcInput.stakingAmountSat,
          stakingTx: Uint8Array.from(
            Buffer.from(clearTxSignatures(stakingTx).toHex(), "hex"),
          ),
          slashingTx: Uint8Array.from(
            Buffer.from(clearTxSignatures(signedSlashingTx).toHex(), "hex"),
          ),
          delegatorSlashingSig: Uint8Array.from(stakingOutputSignatures),
          unbondingTime: btcInput.params.unbondingTime,
          unbondingTx: Uint8Array.from(
            Buffer.from(clearTxSignatures(unbondingTx).toHex(), "hex"),
          ),
          unbondingValue: btcInput.params.unbondingFeeSat,
          unbondingSlashingTx: Uint8Array.from(
            Buffer.from(
              clearTxSignatures(signedUnbondingSlashingTx).toHex(),
              "hex",
            ),
          ),
          delegatorUnbondingSlashingSig: Uint8Array.from(unbondingSignatures),
          stakingTxInclusionProof: undefined,
        };

        // const protoMsg = {
        //   typeUrl: "/babylon.btcstaking.v1.MsgCreateBTCDelegation",
        //   value: btcstakingtx.MsgCreateBTCDelegation.encode(msg).finish(),
        // };
        const protoMsg = {
          typeUrl: "/babylon.btcstaking.v1.MsgCreateBTCDelegation",
          value: msg,
        };
        if (!connected) {
          throw new Error("Not connected to a wallet");
        }

        const stargateClient = await getSigningStargateClient();
        // estimate gas
        const gasEstimate = await stargateClient.simulate(
          bech32Address,
          [protoMsg],
          "estimate fee",
        );
        const gasWanted = Math.ceil(gasEstimate * 1.2);
        // const gasEstimate = 500;
        const fee = {
          amount: [{ denom: "ubbn", amount: (gasWanted * 0.01).toFixed(0) }],
          gas: gasWanted.toString(),
        };
        // sign it
        const result = await stargateClient.signAndBroadcast(
          bech32Address,
          [protoMsg],
          fee,
        );
        console.log("result", result);
      } catch (error) {
        console.error("Failed to create BTC Delegation:", error);
      }
    },
    [
      bech32Address,
      signPsbt,
      signMessageBIP322,
      getSigningStargateClient,
      connected,
      getPublicKeyHex,
    ],
  );

  return { createBtcDelegation };
};

const extractSchnorrSignaturesFromTransaction = (
  singedTransaction: Transaction,
): Buffer | undefined => {
  // Loop through each input to extract the witness signature
  for (const input of singedTransaction.ins) {
    if (input.witness && input.witness.length > 0) {
      const schnorrSignature = input.witness[0];

      // Check that it's a 64-byte Schnorr signature
      if (schnorrSignature.length === 64) {
        return schnorrSignature; // Return the first valid signature found
      }
    }
  }
  return undefined;
};

const clearTxSignatures = (tx: Transaction): Transaction => {
  tx.ins.forEach((input) => {
    input.script = Buffer.alloc(0);
    input.witness = [];
  });
  return tx;
};

function uint8ArrayToHex(uint8Array: Uint8Array): string {
  return Array.from(uint8Array)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function uint8ArrayToBase64(uint8Array: Uint8Array) {
  // Convert Uint8Array to a binary string
  const binaryString = Array.from(uint8Array, (byte) =>
    String.fromCharCode(byte),
  ).join("");

  // Convert binary string to Base64
  return btoa(binaryString);
}

export async function sha256(data: Buffer): Promise<Buffer> {
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Buffer.from(hashBuffer);
}
