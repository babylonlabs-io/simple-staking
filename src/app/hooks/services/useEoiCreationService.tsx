import { btcstakingtx } from "@babylonlabs-io/babylon-proto-ts";
import {
  BTCSigType,
  ProofOfPossessionBTC,
} from "@babylonlabs-io/babylon-proto-ts/dist/generated/babylon/btcstaking/v1/pop";
import { Staking, StakingParams, UTXO } from "@babylonlabs-io/btc-staking-ts";
import { Psbt, Transaction } from "bitcoinjs-lib";
import { fromBech32 } from "bitcoinjs-lib/src/address";
import { useCallback } from "react";

import { useBTCWallet } from "@/app/context/wallet/BTCWalletProvider";
import { useCosmosWallet } from "@/app/context/wallet/CosmosWalletProvider";

export interface BtcStakingInputs {
  finalityProviderPublicKey: string;
  stakingAmountSat: number;
  stakingTimeBlocks: number;
  inputUTXOs: UTXO[];
  feeRate: number;
  params: StakingParams; // Todo: to be replaced with the new params hook
}

export const useEoiCreationService = () => {
  const {
    connected: cosmosConnected,
    bech32Address,
    getSigningStargateClient,
  } = useCosmosWallet();
  const {
    connected: btcConnected,
    signPsbt,
    publicKeyNoCoord,
    address,
    signMessage,
    network,
  } = useBTCWallet();

  const createEoiDelegation = useCallback(
    async (btcInput: BtcStakingInputs) => {
      if (!cosmosConnected || !btcConnected || !network) {
        throw new Error("Wallet not connected");
      }

      const staking = new Staking(
        network,
        {
          address,
          publicKeyNoCoordHex: publicKeyNoCoord,
        },
        btcInput.params,
        btcInput.finalityProviderPublicKey,
        btcInput.stakingTimeBlocks,
      );

      // Create and sign staking transaction
      const { psbt: stakingPsbt } = staking.createStakingTransaction(
        btcInput.stakingAmountSat,
        btcInput.inputUTXOs,
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

      // Create Proof of Possession
      const signedBbnAddress = await signMessage(
        fromBech32(bech32Address).data.toString("hex"),
        "ecdsa",
      );
      const ecdsaSig = Uint8Array.from(
        globalThis.Buffer.from(signedBbnAddress, "base64"),
      );
      const proofOfPossession: ProofOfPossessionBTC = {
        btcSigType: BTCSigType.ECDSA,
        btcSig: ecdsaSig,
      };

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
          delegatorSlashingSig: Uint8Array.from(stakingOutputSignatures),
          unbondingTime: btcInput.params.unbondingTime,
          unbondingTx: Uint8Array.from(cleanedUnbondingTx.toBuffer()),
          unbondingValue:
            btcInput.stakingAmountSat - btcInput.params.unbondingFeeSat,
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

      const stargateClient = await getSigningStargateClient();
      // estimate gas
      const gasEstimate = await stargateClient.simulate(
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
      await stargateClient.signAndBroadcast(bech32Address, [protoMsg], fee);
    },
    [
      cosmosConnected,
      btcConnected,
      network,
      address,
      publicKeyNoCoord,
      signPsbt,
      signMessage,
      bech32Address,
      getSigningStargateClient,
    ],
  );

  return { createEoiDelegation };
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
