import { btcstakingtx } from "@babylonlabs-io/babylon-proto-ts";
import {
  BTCSigType,
  ProofOfPossessionBTC,
} from "@babylonlabs-io/babylon-proto-ts/dist/generated/babylon/btcstaking/v1/pop";
import { Staking } from "@babylonlabs-io/btc-staking-ts";
import { fromBech32 } from "@cosmjs/encoding";
import { Psbt, Transaction } from "bitcoinjs-lib";
import { useCallback } from "react";

import { useBTCWallet } from "@/app/context/wallet/BTCWalletProvider";
import { useCosmosWallet } from "@/app/context/wallet/CosmosWalletProvider";
import { useAppState } from "@/app/state";

import { useParams } from "../api/useParams";

export interface BtcStakingInputs {
  finalityProviderPublicKey: string;
  stakingAmountSat: number;
  stakingTimeBlocks: number;
  feeRate: number;
}

export enum SigningStep {
  STAKING_SLASHING = "staking_slashing",
  UNBONDING_SLASHING = "unbonding_slashing",
  PROOF_OF_POSSESSION = "proof_of_possession",
  SEND_BBN = "send_bbn",
}

export const useEoiCreationService = () => {
  const { availableUTXOs: inputUTXOs } = useAppState();
  const {
    connected: cosmosConnected,
    bech32Address,
    signingStargateClient,
  } = useCosmosWallet();
  const {
    connected: btcConnected,
    signPsbt,
    publicKeyNoCoord,
    address,
    signMessage,
    network: btcNetwork,
  } = useBTCWallet();

  const { data: params } = useParams();

  const createDelegationEoi = useCallback(
    async (
      btcInput: BtcStakingInputs,
      signingCallback: (step: SigningStep) => Promise<void>,
    ) => {
      const stakingParams = params?.bbnStakingParams.latestVersion;
      if (!stakingParams) {
        throw new Error("Staking params not loaded");
      }
      // Perform initial validation
      if (
        !cosmosConnected ||
        !btcConnected ||
        !btcNetwork ||
        !signingStargateClient
      ) {
        throw new Error("Wallet not connected");
      }
      if (!params) {
        throw new Error("Staking params not loaded");
      }
      if (!btcInput.finalityProviderPublicKey) {
        throw new Error("Finality provider not selected");
      }
      if (!btcInput.stakingAmountSat) {
        throw new Error("Staking amount not set");
      }
      if (!btcInput.stakingTimeBlocks) {
        throw new Error("Staking time not set");
      }
      if (!inputUTXOs || inputUTXOs.length === 0) {
        throw new Error("No input UTXOs");
      }
      if (!btcInput.feeRate) {
        throw new Error("Fee rate not set");
      }

      const staking = new Staking(
        btcNetwork,
        {
          address,
          publicKeyNoCoordHex: publicKeyNoCoord,
        },
        stakingParams,
        btcInput.finalityProviderPublicKey,
        btcInput.stakingTimeBlocks,
      );

      // Create and sign staking transaction
      const { psbt: stakingPsbt } = staking.createStakingTransaction(
        btcInput.stakingAmountSat,
        inputUTXOs,
        btcInput.feeRate,
      );
      // TODO: This is temporary solution until we have
      // https://github.com/babylonlabs-io/btc-staking-ts/issues/40
      const signedStakingPsbtHex = await signPsbt(stakingPsbt.toHex());
      const stakingTx = Psbt.fromHex(signedStakingPsbtHex).extractTransaction();
      const cleanedStakingTx = clearTxSignatures(stakingTx);

      // Create and sign unbonding transactionst
      const { psbt: unbondingPsbt } =
        staking.createUnbondingTransaction(cleanedStakingTx);
      // TODO: This is temporary solution until we have
      // https://github.com/babylonlabs-io/btc-staking-ts/issues/40
      const signedUnbondingPsbtHex = await signPsbt(unbondingPsbt.toHex());
      const unbondingTx = Psbt.fromHex(
        signedUnbondingPsbtHex,
      ).extractTransaction();
      const cleanedUnbondingTx = clearTxSignatures(unbondingTx);

      // Create slashing transactions and extract signatures
      const { psbt: slashingPsbt } =
        staking.createStakingOutputSlashingTransaction(cleanedStakingTx);
      const signedSlashingPsbtHex = await signPsbt(slashingPsbt.toHex());
      const signedSlashingTx = Psbt.fromHex(
        signedSlashingPsbtHex,
      ).extractTransaction();
      const slashingSig =
        extractSchnorrSignaturesFromTransaction(signedSlashingTx);
      if (!slashingSig) {
        throw new Error(
          "No signature found in the staking output slashing PSBT",
        );
      }
      await signingCallback(SigningStep.STAKING_SLASHING);

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
      await signingCallback(SigningStep.UNBONDING_SLASHING);

      // Create Proof of Possession
      const bech32AddressHex = uint8ArrayToHex(fromBech32(bech32Address).data);
      const signedBbnAddress = await signMessage(bech32AddressHex, "ecdsa");
      const ecdsaSig = Uint8Array.from(
        globalThis.Buffer.from(signedBbnAddress, "base64"),
      );
      const proofOfPossession: ProofOfPossessionBTC = {
        btcSigType: BTCSigType.ECDSA,
        btcSig: ecdsaSig,
      };
      await signingCallback(SigningStep.PROOF_OF_POSSESSION);

      // Prepare and send protobuf message
      const msg: btcstakingtx.MsgCreateBTCDelegation =
        btcstakingtx.MsgCreateBTCDelegation.fromPartial({
          stakerAddr: bech32Address,
          pop: proofOfPossession,
          btcPk: Uint8Array.from(Buffer.from(publicKeyNoCoord, "hex")),
          fpBtcPkList: [
            Uint8Array.from(
              Buffer.from(btcInput.finalityProviderPublicKey, "hex"),
            ),
          ],
          stakingTime: btcInput.stakingTimeBlocks,
          stakingValue: btcInput.stakingAmountSat,
          stakingTx: Uint8Array.from(cleanedStakingTx.toBuffer()),
          slashingTx: Uint8Array.from(
            Buffer.from(clearTxSignatures(signedSlashingTx).toHex(), "hex"),
          ),
          delegatorSlashingSig: Uint8Array.from(slashingSig),
          unbondingTime: stakingParams.unbondingTime,
          unbondingTx: Uint8Array.from(cleanedUnbondingTx.toBuffer()),
          unbondingValue:
            btcInput.stakingAmountSat - stakingParams.unbondingFeeSat,
          unbondingSlashingTx: Uint8Array.from(
            Buffer.from(
              clearTxSignatures(signedUnbondingSlashingTx).toHex(),
              "hex",
            ),
          ),
          delegatorUnbondingSlashingSig: Uint8Array.from(unbondingSignatures),
          stakingTxInclusionProof: undefined,
        });

      const protoMsg = {
        typeUrl: "/babylon.btcstaking.v1.MsgCreateBTCDelegation",
        value: msg,
      };

      // estimate gas
      const gasEstimate = await signingStargateClient.simulate(
        bech32Address,
        [protoMsg],
        "estimate fee",
      );
      const gasWanted = Math.ceil(gasEstimate * 1.2);
      const fee = {
        amount: [{ denom: "ubbn", amount: (gasWanted * 0.01).toFixed(0) }],
        gas: gasWanted.toString(),
      };
      // sign it
      await signingStargateClient.signAndBroadcast(
        bech32Address,
        [protoMsg],
        fee,
      );
      await signingCallback(SigningStep.SEND_BBN);
    },
    [
      cosmosConnected,
      btcConnected,
      btcNetwork,
      params,
      inputUTXOs,
      address,
      publicKeyNoCoord,
      signPsbt,
      signMessage,
      bech32Address,
      signingStargateClient,
    ],
  );

  return { createDelegationEoi };
};

const clearTxSignatures = (tx: Transaction): Transaction => {
  tx.ins.forEach((input) => {
    input.script = Buffer.alloc(0);
    input.witness = [];
  });
  return tx;
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

function uint8ArrayToHex(uint8Array: Uint8Array): string {
  return Array.from(uint8Array)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}
