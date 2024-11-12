import { btcstakingtx } from "@babylonlabs-io/babylon-proto-ts";
import { InclusionProof } from "@babylonlabs-io/babylon-proto-ts/dist/generated/babylon/btcstaking/v1/btcstaking";
import {
  BTCSigType,
  ProofOfPossessionBTC,
} from "@babylonlabs-io/babylon-proto-ts/dist/generated/babylon/btcstaking/v1/pop";
import { Staking } from "@babylonlabs-io/btc-staking-ts";
import { fromBech32 } from "@cosmjs/encoding";
import { SigningStargateClient } from "@cosmjs/stargate";
import { Network, Psbt, Transaction } from "bitcoinjs-lib";
import { useCallback } from "react";

import { useBTCWallet } from "@/app/context/wallet/BTCWalletProvider";
import { useCosmosWallet } from "@/app/context/wallet/CosmosWalletProvider";
import { useAppState } from "@/app/state";
import { BbnStakingParamsVersion } from "@/app/types/params";
import {
  clearTxSignatures,
  extractSchnorrSignaturesFromTransaction,
  uint8ArrayToHex,
} from "@/utils/delegations";

export interface BtcStakingInputs {
  finalityProviderPublicKey: string;
  stakingAmountSat: number;
  stakingTimeBlocks: number;
}

interface BtcSigningFuncs {
  signPsbt: (psbtHex: string) => Promise<string>;
  signMessage: (
    message: string,
    type?: "ecdsa" | "bip322-simple",
  ) => Promise<string>;
  signingCallback: (step: SigningStep) => Promise<void>;
}

export enum SigningStep {
  STAKING_SLASHING = "staking_slashing",
  UNBONDING_SLASHING = "unbonding_slashing",
  PROOF_OF_POSSESSION = "proof_of_possession",
  SEND_BBN = "send_bbn",
}

export const useTransactionService = () => {
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

  const { params } = useAppState();
  const latestParam = params?.bbnStakingParams?.latestParam;
  const genesisParam = params?.bbnStakingParams?.genesisParam;

  const createDelegationEoi = useCallback(
    async (
      stakingInput: BtcStakingInputs,
      feeRate: number,
      signingCallback: (step: SigningStep) => Promise<void>,
    ) => {
      // Perform checks
      checkWalletConnection(
        cosmosConnected,
        btcConnected,
        btcNetwork,
        signingStargateClient,
      );
      validateStakingInput(stakingInput);
      if (!latestParam) throw new Error("Staking params not loaded");

      const staking = new Staking(
        btcNetwork!,
        {
          address,
          publicKeyNoCoordHex: publicKeyNoCoord,
        },
        latestParam,
        stakingInput.finalityProviderPublicKey,
        stakingInput.stakingTimeBlocks,
      );

      // Create and sign staking transaction
      const { psbt: stakingPsbt } = staking.createStakingTransaction(
        stakingInput.stakingAmountSat,
        inputUTXOs!,
        feeRate,
      );
      // TODO: This is temporary solution until we have
      // https://github.com/babylonlabs-io/btc-staking-ts/issues/40
      const signedStakingPsbtHex = await signPsbt(stakingPsbt.toHex());
      const stakingTx = Psbt.fromHex(signedStakingPsbtHex).extractTransaction();

      const delegationMsg = await createBtcDelegationMsg(
        staking,
        stakingInput,
        stakingTx,
        bech32Address,
        { address, publicKeyNoCoordHex: publicKeyNoCoord },
        latestParam,
        { signPsbt, signMessage, signingCallback },
      );
      await sendBbnTx(signingStargateClient!, bech32Address, delegationMsg);
      await signingCallback(SigningStep.SEND_BBN);
    },
    [
      cosmosConnected,
      btcConnected,
      btcNetwork,
      signingStargateClient,
      latestParam,
      address,
      publicKeyNoCoord,
      inputUTXOs,
      signPsbt,
      bech32Address,
      signMessage,
    ],
  );

  const estimateStakingFee = useCallback(
    (stakingInput: BtcStakingInputs, feeRate: number): number => {
      // Perform checks
      checkWalletConnection(
        cosmosConnected,
        btcConnected,
        btcNetwork,
        signingStargateClient,
      );
      if (!latestParam) throw new Error("Staking params not loaded");
      validateStakingInput(stakingInput);

      const staking = new Staking(
        btcNetwork!,
        {
          address,
          publicKeyNoCoordHex: publicKeyNoCoord,
        },
        latestParam,
        stakingInput.finalityProviderPublicKey,
        stakingInput.stakingTimeBlocks,
      );

      const { fee: stakingFee } = staking.createStakingTransaction(
        stakingInput.stakingAmountSat,
        inputUTXOs!,
        feeRate,
      );
      return stakingFee;
    },
    [
      cosmosConnected,
      btcConnected,
      btcNetwork,
      signingStargateClient,
      latestParam,
      address,
      publicKeyNoCoord,
      inputUTXOs,
    ],
  );

  const transitionPhase1Delegation = useCallback(
    async (
      stakingTxHex: string,
      stakingInput: BtcStakingInputs,
      signingCallback: (step: SigningStep) => Promise<void>,
    ) => {
      // Perform checks
      checkWalletConnection(
        cosmosConnected,
        btcConnected,
        btcNetwork,
        signingStargateClient,
      );
      if (!genesisParam) throw new Error("V1 params not loaded");
      validateStakingInput(stakingInput);

      const stakingTx = Transaction.fromHex(stakingTxHex);
      const stakingInstance = new Staking(
        btcNetwork!,
        { address, publicKeyNoCoordHex: publicKeyNoCoord },
        genesisParam,
        stakingInput.finalityProviderPublicKey,
        stakingInput.stakingTimeBlocks,
      );

      const delegationMsg = await createBtcDelegationMsg(
        stakingInstance,
        stakingInput,
        stakingTx,
        bech32Address,
        { address, publicKeyNoCoordHex: publicKeyNoCoord },
        genesisParam,
        {
          signPsbt,
          signMessage,
          signingCallback,
        },
      );
      await sendBbnTx(signingStargateClient!, bech32Address, delegationMsg);
      await signingCallback(SigningStep.SEND_BBN);
    },
    [
      cosmosConnected,
      btcConnected,
      btcNetwork,
      signingStargateClient,
      genesisParam,
      bech32Address,
      address,
      publicKeyNoCoord,
      signPsbt,
      signMessage,
    ],
  );

  return {
    createDelegationEoi,
    estimateStakingFee,
    transitionPhase1Delegation,
  };
};

const sendBbnTx = async (
  signingStargateClient: SigningStargateClient,
  bech32Address: string,
  delegationMsg: any,
) => {
  // estimate gas
  const gasEstimate = await signingStargateClient!.simulate(
    bech32Address,
    [delegationMsg],
    "estimate fee",
  );
  // TODO: The gas calculation need to be improved
  // https://github.com/babylonlabs-io/simple-staking/issues/320
  const gasWanted = Math.ceil(gasEstimate * 1.2);
  const fee = {
    amount: [{ denom: "ubbn", amount: (gasWanted * 0.01).toFixed(0) }],
    gas: gasWanted.toString(),
  };
  // sign it
  await signingStargateClient!.signAndBroadcast(
    bech32Address,
    [delegationMsg],
    fee,
  );
};

const createBtcDelegationMsg = async (
  stakingInstance: Staking,
  stakingInput: BtcStakingInputs,
  stakingTx: Transaction,
  bech32Address: string,
  stakerInfo: {
    address: string;
    publicKeyNoCoordHex: string;
  },
  param: BbnStakingParamsVersion,
  btcSigningFuncs: BtcSigningFuncs,
  inclusionProof?: InclusionProof,
) => {
  const cleanedStakingTx = clearTxSignatures(stakingTx);

  const { psbt: unbondingPsbt } =
    stakingInstance.createUnbondingTransaction(cleanedStakingTx);
  // TODO: This is temporary solution until we have
  // https://github.com/babylonlabs-io/btc-staking-ts/issues/40
  const signedUnbondingPsbtHex = await btcSigningFuncs.signPsbt(
    unbondingPsbt.toHex(),
  );
  const unbondingTx = Psbt.fromHex(signedUnbondingPsbtHex).extractTransaction();
  const cleanedUnbondingTx = clearTxSignatures(unbondingTx);

  // Create slashing transactions and extract signatures
  const { psbt: slashingPsbt } =
    stakingInstance.createStakingOutputSlashingTransaction(cleanedStakingTx);
  const signedSlashingPsbtHex = await btcSigningFuncs.signPsbt(
    slashingPsbt.toHex(),
  );
  const signedSlashingTx = Psbt.fromHex(
    signedSlashingPsbtHex,
  ).extractTransaction();
  const slashingSig = extractSchnorrSignaturesFromTransaction(signedSlashingTx);
  if (!slashingSig) {
    throw new Error("No signature found in the staking output slashing PSBT");
  }
  await btcSigningFuncs.signingCallback(SigningStep.STAKING_SLASHING);

  const { psbt: unbondingSlashingPsbt } =
    stakingInstance.createUnbondingOutputSlashingTransaction(unbondingTx);
  const signedUnbondingSlashingPsbtHex = await btcSigningFuncs.signPsbt(
    unbondingSlashingPsbt.toHex(),
  );
  const signedUnbondingSlashingTx = Psbt.fromHex(
    signedUnbondingSlashingPsbtHex,
  ).extractTransaction();
  const unbondingSignatures = extractSchnorrSignaturesFromTransaction(
    signedUnbondingSlashingTx,
  );
  if (!unbondingSignatures) {
    throw new Error("No signature found in the unbonding output slashing PSBT");
  }
  await btcSigningFuncs.signingCallback(SigningStep.UNBONDING_SLASHING);

  // Create Proof of Possession
  const bech32AddressHex = uint8ArrayToHex(fromBech32(bech32Address).data);
  const signedBbnAddress = await btcSigningFuncs.signMessage(
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
  await btcSigningFuncs.signingCallback(SigningStep.PROOF_OF_POSSESSION);

  // Prepare and send protobuf message
  const msg: btcstakingtx.MsgCreateBTCDelegation =
    btcstakingtx.MsgCreateBTCDelegation.fromPartial({
      stakerAddr: bech32Address,
      pop: proofOfPossession,
      btcPk: Uint8Array.from(
        Buffer.from(stakerInfo.publicKeyNoCoordHex, "hex"),
      ),
      fpBtcPkList: [
        Uint8Array.from(
          Buffer.from(stakingInput.finalityProviderPublicKey, "hex"),
        ),
      ],
      stakingTime: stakingInput.stakingTimeBlocks,
      stakingValue: stakingInput.stakingAmountSat,
      stakingTx: Uint8Array.from(cleanedStakingTx.toBuffer()),
      slashingTx: Uint8Array.from(
        Buffer.from(clearTxSignatures(signedSlashingTx).toHex(), "hex"),
      ),
      delegatorSlashingSig: Uint8Array.from(slashingSig),
      // TODO: Confirm with core on the value whether its inclusive or exclusive
      unbondingTime: param.unbondingTime + 1,
      unbondingTx: Uint8Array.from(cleanedUnbondingTx.toBuffer()),
      unbondingValue: stakingInput.stakingAmountSat - param.unbondingFeeSat,
      unbondingSlashingTx: Uint8Array.from(
        Buffer.from(
          clearTxSignatures(signedUnbondingSlashingTx).toHex(),
          "hex",
        ),
      ),
      delegatorUnbondingSlashingSig: Uint8Array.from(unbondingSignatures),
      stakingTxInclusionProof: inclusionProof,
    });

  return {
    typeUrl: "/babylon.btcstaking.v1.MsgCreateBTCDelegation",
    value: msg,
  };
};

const validateStakingInput = (stakingInput: BtcStakingInputs) => {
  if (!stakingInput.finalityProviderPublicKey)
    throw new Error("Finality provider not selected");
  if (!stakingInput.stakingAmountSat) throw new Error("Staking amount not set");
  if (!stakingInput.stakingTimeBlocks) throw new Error("Staking time not set");
};

const checkWalletConnection = (
  cosmosConnected: boolean,
  btcConnected: boolean,
  btcNetwork: Network | undefined,
  signingStargateClient: SigningStargateClient | undefined,
) => {
  if (
    !cosmosConnected ||
    !btcConnected ||
    !btcNetwork ||
    !signingStargateClient
  )
    throw new Error("Wallet not connected");
};
