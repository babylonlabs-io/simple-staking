import {
  btccheckpoint,
  btcstaking,
  btcstakingtx,
} from "@babylonlabs-io/babylon-proto-ts";
import {
  BTCSigType,
  ProofOfPossessionBTC,
} from "@babylonlabs-io/babylon-proto-ts/dist/generated/babylon/btcstaking/v1/pop";
import { createCovenantWitness, Staking } from "@babylonlabs-io/btc-staking-ts";
import { fromBech32 } from "@cosmjs/encoding";
import { SigningStargateClient } from "@cosmjs/stargate";
import { Network, Psbt, Transaction } from "bitcoinjs-lib";
import { useCallback } from "react";

import { EOIStepStatus } from "@/app/components/Modals/EOIModal";
import { useBTCWallet } from "@/app/context/wallet/BTCWalletProvider";
import { useCosmosWallet } from "@/app/context/wallet/CosmosWalletProvider";
import { useAppState } from "@/app/state";
import { BbnStakingParamsVersion } from "@/app/types/networkInfo";
import { deriveMerkleProof } from "@/utils/btc";
import { reverseBuffer } from "@/utils/buffer";
import {
  clearTxSignatures,
  extractSchnorrSignaturesFromTransaction,
  uint8ArrayToHex,
  validateStakingInput,
} from "@/utils/delegations";
import { getFeeRateFromMempool } from "@/utils/getFeeRateFromMempool";
import { getTxInfo, getTxMerkleProof } from "@/utils/mempool_api";
import { getBbnParamByBtcHeight } from "@/utils/params";
import { BBN_REGISTRY_TYPE_URLS } from "@/utils/wallet/bbnRegistry";

import { useBTCTipHeight } from "../client/api/useBTCTipHeight";
import { useNetworkFees } from "../client/api/useNetworkFees";
import { useBbnTransaction } from "../client/query/useBbnTransaction";

export interface BtcStakingInputs {
  finalityProviderPkNoCoordHex: string;
  stakingAmountSat: number;
  stakingTimelock: number;
}

interface BtcSigningFuncs {
  signPsbt: (psbtHex: string) => Promise<string>;
  signMessage: (
    message: string,
    type?: "ecdsa" | "bip322-simple",
  ) => Promise<string>;
  signingCallback: (step: SigningStep, status: EOIStepStatus) => Promise<void>;
}

export enum SigningStep {
  STAKING_SLASHING = "staking_slashing",
  UNBONDING_SLASHING = "unbonding_slashing",
  PROOF_OF_POSSESSION = "proof_of_possession",
  SEND_BBN = "send_bbn",
}

export const useTransactionService = () => {
  const { availableUTXOs: inputUTXOs, networkInfo } = useAppState();
  const { sendBbnTx } = useBbnTransaction();
  const { data: networkFees } = useNetworkFees();
  const { defaultFeeRate } = getFeeRateFromMempool(networkFees);
  const { data: tipHeight } = useBTCTipHeight();

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
    pushTx,
  } = useBTCWallet();

  const latestParam = networkInfo?.params.bbnStakingParams?.latestParam;
  const versionedParams = networkInfo?.params.bbnStakingParams?.versions;

  /**
   * Create the delegation EOI
   *
   * @param stakingInput - The staking inputs
   * @param feeRate - The fee rate
   * @param signingCallback - The signing callback
   * @returns The staking transaction hash
   */
  const createDelegationEoi = useCallback(
    async (
      stakingInput: BtcStakingInputs,
      feeRate: number,
      signingCallback: (
        step: SigningStep,
        status: EOIStepStatus,
      ) => Promise<void>,
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
      if (!tipHeight) throw new Error("BTC tip height not loaded");
      // EOI and StakingTx must be created after the latestParam activation height
      // This is to ensure that the EOI and StakingTx are valid
      if (tipHeight < latestParam.btcActivationHeight - 1) {
        throw new Error(
          `BTC tip height ${tipHeight} is less than the 
          activation height ${latestParam.btcActivationHeight - 1}`,
        );
      }

      const staking = new Staking(
        btcNetwork!,
        {
          address,
          publicKeyNoCoordHex: publicKeyNoCoord,
        },
        latestParam,
        stakingInput.finalityProviderPkNoCoordHex,
        stakingInput.stakingTimelock,
      );

      // Create and sign staking transaction
      const { transaction } = staking.createStakingTransaction(
        stakingInput.stakingAmountSat,
        inputUTXOs!,
        feeRate,
      );

      const delegationMsg = await createBtcDelegationMsg(
        staking,
        stakingInput,
        transaction,
        bech32Address,
        { address, publicKeyNoCoordHex: publicKeyNoCoord },
        latestParam,
        { signPsbt, signMessage, signingCallback },
      );
      await signingCallback(SigningStep.SEND_BBN, EOIStepStatus.PROCESSING);
      await sendBbnTx(delegationMsg);
      await signingCallback(SigningStep.SEND_BBN, EOIStepStatus.SIGNED);

      return transaction.getId();
    },
    [
      cosmosConnected,
      btcConnected,
      btcNetwork,
      signingStargateClient,
      latestParam,
      tipHeight,
      address,
      publicKeyNoCoord,
      inputUTXOs,
      bech32Address,
      signPsbt,
      signMessage,
      sendBbnTx,
    ],
  );

  /**
   * Estimate the staking fee
   *
   * @param stakingInput - The staking inputs
   * @param feeRate - The fee rate
   * @returns The staking fee
   */
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
        stakingInput.finalityProviderPkNoCoordHex,
        stakingInput.stakingTimelock,
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

  /**
   * Transition the delegation to phase 1
   *
   * @param stakingTxHex - The staking transaction hex
   * @param stakingHeight - The staking height
   * @param stakingInput - The staking inputs
   * @param signingCallback - The signing callback
   */
  const transitionPhase1Delegation = useCallback(
    async (
      stakingTxHex: string,
      stakingHeight: number,
      stakingInput: BtcStakingInputs,
      signingCallback: (
        step: SigningStep,
        status: EOIStepStatus,
      ) => Promise<void>,
    ) => {
      // Perform checks
      checkWalletConnection(
        cosmosConnected,
        btcConnected,
        btcNetwork,
        signingStargateClient,
      );
      if (!versionedParams || versionedParams?.length === 0) {
        throw new Error("Params not loaded");
      }

      // Get the staking params at the time of the staking transaction
      const p = getBbnParamByBtcHeight(stakingHeight, versionedParams);
      if (!p)
        throw new Error(
          `Unable to find staking params for height ${stakingHeight}`,
        );

      validateStakingInput(stakingInput);

      const stakingTx = Transaction.fromHex(stakingTxHex);
      const stakingInstance = new Staking(
        btcNetwork!,
        { address, publicKeyNoCoordHex: publicKeyNoCoord },
        p,
        stakingInput.finalityProviderPkNoCoordHex,
        stakingInput.stakingTimelock,
      );

      // Get the merkle proof
      const inclusionProof = await getInclusionProof(stakingTx);
      // Create delegation message
      const delegationMsg = await createBtcDelegationMsg(
        stakingInstance,
        stakingInput,
        stakingTx,
        bech32Address,
        { address, publicKeyNoCoordHex: publicKeyNoCoord },
        p,
        {
          signPsbt,
          signMessage,
          signingCallback,
        },
        inclusionProof,
      );
      await signingCallback(SigningStep.SEND_BBN, EOIStepStatus.PROCESSING);
      await sendBbnTx(delegationMsg);
      await signingCallback(SigningStep.SEND_BBN, EOIStepStatus.SIGNED);
    },
    [
      cosmosConnected,
      btcConnected,
      btcNetwork,
      signingStargateClient,
      versionedParams,
      address,
      publicKeyNoCoord,
      bech32Address,
      signPsbt,
      signMessage,
      sendBbnTx,
    ],
  );

  /**
   * Submit the staking transaction
   *
   * @param stakingInput - The staking inputs
   * @param paramVersion - The param version
   * @param expectedTxHashHex - The expected transaction hash hex
   * @param stakingTxHex - The staking transaction hex
   */
  const submitStakingTx = useCallback(
    async (
      stakingInput: BtcStakingInputs,
      paramVersion: number,
      expectedTxHashHex: string,
      stakingTxHex: string,
    ) => {
      // Perform checks
      if (!latestParam) {
        throw new Error("Staking parameters not loaded");
      }
      if (!btcConnected || !btcNetwork)
        throw new Error("BTC Wallet not connected");

      validateStakingInput(stakingInput);

      // Here we utilise the param version to check if the EOI is outdated
      if (latestParam.version != paramVersion) {
        throw new Error(
          "The EOI is outdated due to there is a newer version of staking params",
        );
      }

      const staking = new Staking(
        btcNetwork!,
        {
          address,
          publicKeyNoCoordHex: publicKeyNoCoord,
        },
        latestParam,
        stakingInput.finalityProviderPkNoCoordHex,
        stakingInput.stakingTimelock,
      );
      const stakingPsbt = staking.toStakingPsbt(
        Transaction.fromHex(stakingTxHex),
        inputUTXOs!,
      );

      const signedStakingPsbtHex = await signPsbt(stakingPsbt.toHex());
      const signedStakingTx =
        Psbt.fromHex(signedStakingPsbtHex).extractTransaction();
      if (signedStakingTx.getId() !== expectedTxHashHex) {
        throw new Error(
          `Staking transaction hash mismatch, expected ${expectedTxHashHex} but got ${signedStakingTx.getId()}`,
        );
      }
      await pushTx(signedStakingTx.toHex());
    },
    [
      latestParam,
      btcConnected,
      btcNetwork,
      address,
      publicKeyNoCoord,
      inputUTXOs,
      signPsbt,
      pushTx,
    ],
  );

  const submitUnbondingTx = useCallback(
    async (
      stakingInput: BtcStakingInputs,
      stakingHeight: number,
      stakingTxHex: string,
      unbondingTxHex: string,
      covenantUnbondingSignatures: {
        btcPkHex: string;
        sigHex: string;
      }[],
    ) => {
      // Perform checks
      if (!versionedParams || versionedParams?.length === 0) {
        throw new Error("Params not loaded");
      }
      if (!btcConnected || !btcNetwork)
        throw new Error("BTC Wallet not connected");

      validateStakingInput(stakingInput);

      const stakingTx = Transaction.fromHex(stakingTxHex);

      // Get the staking params at the time of the staking transaction
      const p = getBbnParamByBtcHeight(stakingHeight, versionedParams);
      if (!p)
        throw new Error(
          `Unable to find staking params for height ${stakingHeight}`,
        );

      const staking = new Staking(
        btcNetwork!,
        {
          address,
          publicKeyNoCoordHex: publicKeyNoCoord,
        },
        p,
        stakingInput.finalityProviderPkNoCoordHex,
        stakingInput.stakingTimelock,
      );

      const unbondingTx = Transaction.fromHex(unbondingTxHex);
      const unbondingPsbt = staking.toUnbondingPsbt(unbondingTx, stakingTx);
      const signedUnbondingPsbtHex = await signPsbt(unbondingPsbt.toHex());

      // Compare the unbonding tx hash with the one from API
      const signedUnbondingTx = Psbt.fromHex(
        signedUnbondingPsbtHex,
      ).extractTransaction();

      // Add covenant unbonding signatures
      // Convert the params of covenants to buffer
      const covenantBuffers = p.covenantNoCoordPks.map((covenant) =>
        Buffer.from(covenant, "hex"),
      );
      const witness = createCovenantWitness(
        signedUnbondingTx.ins[0].witness,
        covenantBuffers,
        covenantUnbondingSignatures,
        p.covenantQuorum,
      );
      // Overwrite the witness to include the covenant unbonding signatures
      signedUnbondingTx.ins[0].witness = witness;
      // Perform the final check on the unbonding tx hash
      const unbondingTxId = unbondingTx.getId();
      if (signedUnbondingTx.getId() !== unbondingTxId) {
        throw new Error(
          `Unbonding transaction hash mismatch, expected ${unbondingTxId} but got ${signedUnbondingTx.getId()}`,
        );
      }
      await pushTx(signedUnbondingTx.toHex());
    },
    [
      versionedParams,
      btcConnected,
      btcNetwork,
      address,
      publicKeyNoCoord,
      signPsbt,
      pushTx,
    ],
  );

  /**
   * Withdraw from the early unbonding transaction which is now unbonded
   *
   * @param stakingInput - The staking inputs
   * @param paramVersion - The param version
   * @param unbondingTxHex - The unbonding transaction hex
   */
  const submitEarlyUnbondedWithdrawalTx = useCallback(
    async (
      stakingInput: BtcStakingInputs,
      stakingHeight: number,
      earlyUnbondingTxHex: string,
    ) => {
      // Perform checks
      if (!versionedParams || versionedParams?.length === 0) {
        throw new Error("Params not loaded");
      }
      if (!btcConnected || !btcNetwork)
        throw new Error("BTC Wallet not connected");

      validateStakingInput(stakingInput);

      const p = getBbnParamByBtcHeight(stakingHeight, versionedParams);
      if (!p)
        throw new Error(
          `Unable to find staking params for height ${stakingHeight}`,
        );

      const staking = new Staking(
        btcNetwork!,
        {
          address,
          publicKeyNoCoordHex: publicKeyNoCoord,
        },
        p,
        stakingInput.finalityProviderPkNoCoordHex,
        stakingInput.stakingTimelock,
      );

      const { psbt: unbondingPsbt } =
        staking.createWithdrawEarlyUnbondedTransaction(
          Transaction.fromHex(earlyUnbondingTxHex),
          defaultFeeRate,
        );

      const signedWithdrawalPsbtHex = await signPsbt(unbondingPsbt.toHex());
      const signedWithdrawalTx = Psbt.fromHex(
        signedWithdrawalPsbtHex,
      ).extractTransaction();
      await pushTx(signedWithdrawalTx.toHex());
    },
    [
      versionedParams,
      btcConnected,
      btcNetwork,
      address,
      publicKeyNoCoord,
      defaultFeeRate,
      signPsbt,
      pushTx,
    ],
  );

  /**
   * Submit the timelock unbonded withdrawal transaction
   *
   * @param stakingInput - The staking inputs
   * @param paramVersion - The param version
   * @param stakingTxHex - The staking transaction hex
   */
  const submitTimelockUnbondedWithdrawalTx = useCallback(
    async (
      stakingInput: BtcStakingInputs,
      stakingHeight: number,
      stakingTxHex: string,
    ) => {
      // Perform checks
      if (!versionedParams || versionedParams?.length === 0) {
        throw new Error("Params not loaded");
      }
      if (!btcConnected || !btcNetwork)
        throw new Error("BTC Wallet not connected");

      validateStakingInput(stakingInput);

      const p = getBbnParamByBtcHeight(stakingHeight, versionedParams);
      if (!p)
        throw new Error(
          `Unable to find staking params for height ${stakingHeight}`,
        );

      const staking = new Staking(
        btcNetwork!,
        {
          address,
          publicKeyNoCoordHex: publicKeyNoCoord,
        },
        p,
        stakingInput.finalityProviderPkNoCoordHex,
        stakingInput.stakingTimelock,
      );

      const { psbt } = staking.createWithdrawStakingExpiredTransaction(
        Transaction.fromHex(stakingTxHex),
        defaultFeeRate,
      );

      const signedWithdrawalPsbtHex = await signPsbt(psbt.toHex());
      const signedWithdrawalTx = Psbt.fromHex(
        signedWithdrawalPsbtHex,
      ).extractTransaction();
      await pushTx(signedWithdrawalTx.toHex());
    },
    [
      versionedParams,
      btcConnected,
      btcNetwork,
      address,
      publicKeyNoCoord,
      signPsbt,
      pushTx,
      defaultFeeRate,
    ],
  );

  return {
    createDelegationEoi,
    estimateStakingFee,
    transitionPhase1Delegation,
    submitStakingTx,
    submitUnbondingTx,
    submitEarlyUnbondedWithdrawalTx,
    submitTimelockUnbondedWithdrawalTx,
  };
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
  inclusionProof?: btcstaking.InclusionProof,
) => {
  const { transaction: unbondingTx } =
    stakingInstance.createUnbondingTransaction(stakingTx);

  // Create slashing transactions and extract signatures
  await btcSigningFuncs.signingCallback(
    SigningStep.STAKING_SLASHING,
    EOIStepStatus.PROCESSING,
  );
  const { psbt: slashingPsbt } =
    stakingInstance.createStakingOutputSlashingTransaction(stakingTx);
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
  await btcSigningFuncs.signingCallback(
    SigningStep.STAKING_SLASHING,
    EOIStepStatus.SIGNED,
  );

  await btcSigningFuncs.signingCallback(
    SigningStep.UNBONDING_SLASHING,
    EOIStepStatus.PROCESSING,
  );
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
  await btcSigningFuncs.signingCallback(
    SigningStep.UNBONDING_SLASHING,
    EOIStepStatus.SIGNED,
  );

  await btcSigningFuncs.signingCallback(
    SigningStep.PROOF_OF_POSSESSION,
    EOIStepStatus.PROCESSING,
  );
  // Create Proof of Possession
  const bech32AddressHex = uint8ArrayToHex(fromBech32(bech32Address).data);
  const signedBbnAddress = await btcSigningFuncs.signMessage(
    bech32AddressHex,
    "ecdsa",
  );
  const ecdsaSig = Uint8Array.from(Buffer.from(signedBbnAddress, "base64"));
  const proofOfPossession: ProofOfPossessionBTC = {
    btcSigType: BTCSigType.ECDSA,
    btcSig: ecdsaSig,
  };
  await btcSigningFuncs.signingCallback(
    SigningStep.PROOF_OF_POSSESSION,
    EOIStepStatus.SIGNED,
  );

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
          Buffer.from(stakingInput.finalityProviderPkNoCoordHex, "hex"),
        ),
      ],
      stakingTime: stakingInput.stakingTimelock,
      stakingValue: stakingInput.stakingAmountSat,
      stakingTx: Uint8Array.from(stakingTx.toBuffer()),
      slashingTx: Uint8Array.from(
        Buffer.from(clearTxSignatures(signedSlashingTx).toHex(), "hex"),
      ),
      delegatorSlashingSig: Uint8Array.from(slashingSig),
      unbondingTime: param.unbondingTime,
      unbondingTx: Uint8Array.from(unbondingTx.toBuffer()),
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
    typeUrl: BBN_REGISTRY_TYPE_URLS.MsgCreateBTCDelegation,
    value: msg,
  };
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

const getInclusionProof = async (
  stakingTx: Transaction,
): Promise<btcstaking.InclusionProof> => {
  // Get the merkle proof
  const { pos, merkle } = await getTxMerkleProof(stakingTx.getId());
  const proofHex = deriveMerkleProof(merkle);

  const {
    status: { blockHash },
  } = await getTxInfo(stakingTx.getId());

  const hash = reverseBuffer(Uint8Array.from(Buffer.from(blockHash, "hex")));
  const inclusionProofKey: btccheckpoint.TransactionKey =
    btccheckpoint.TransactionKey.fromPartial({
      index: pos,
      hash,
    });
  return btcstaking.InclusionProof.fromPartial({
    key: inclusionProofKey,
    proof: Uint8Array.from(Buffer.from(proofHex, "hex")),
  });
};
