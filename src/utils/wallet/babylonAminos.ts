import { btcstakingtx, incentivetx } from "@babylonlabs-io/babylon-proto-ts";
import { AminoTypes } from "@cosmjs/stargate";

import { BBN_REGISTRY_TYPE_URLS } from "./bbnRegistry";

const msgCreateBTCDelegationConverter = {
  [BBN_REGISTRY_TYPE_URLS.MsgCreateBTCDelegation]: {
    aminoType: BBN_REGISTRY_TYPE_URLS.MsgCreateBTCDelegation,
    //
    // 1) Protobuf -> Amino JSON
    //
    toAmino: (msg: btcstakingtx.MsgCreateBTCDelegation) => {
      return {
        staker_addr: msg.stakerAddr,
        pop: {
          btc_sig_type: msg.pop?.btcSigType,
          btc_sig: msg.pop?.btcSig,
        },
        btc_pk: msg.btcPk,
        fp_btc_pk_list: msg.fpBtcPkList,
        staking_time: msg.stakingTime,
        staking_value: msg.stakingValue,
        staking_tx: msg.stakingTx,
        slashing_tx: msg.slashingTx,
        delegator_slashing_sig: msg.delegatorSlashingSig,
        unbonding_time: msg.unbondingTime,
        unbonding_tx: msg.unbondingTx,
        unbonding_value: msg.unbondingValue,
        unbonding_slashing_tx: msg.unbondingSlashingTx,
        delegator_unbonding_slashing_sig: msg.delegatorUnbondingSlashingSig,
        ...(msg.stakingTxInclusionProof?.key
          ? {
              staking_tx_inclusion_proof: {
                key: {
                  index: msg.stakingTxInclusionProof.key.index,
                  hash: msg.stakingTxInclusionProof.key.hash,
                },
                proof: msg.stakingTxInclusionProof.proof,
              },
            }
          : {}),
      };
    },

    //
    // 2) Amino JSON -> Protobuf
    //
    fromAmino: (json: any): btcstakingtx.MsgCreateBTCDelegation => {
      const hasInclusionProof = json.staking_tx_inclusion_proof?.key.hash;

      return {
        stakerAddr: json.staker_addr,
        pop: {
          btcSigType: json.pop.btc_sig_type,
          btcSig: new Uint8Array(Object.values(json.pop.btc_sig)),
        },
        btcPk: new Uint8Array(Object.values(json.btc_pk)),
        fpBtcPkList: json.fp_btc_pk_list.map(
          (pk: any) => new Uint8Array(Object.values(pk)),
        ),
        stakingTime: json.staking_time,
        stakingValue: json.staking_value,
        stakingTx: new Uint8Array(Object.values(json.staking_tx)),
        stakingTxInclusionProof: hasInclusionProof
          ? {
              key: {
                index: json.staking_tx_inclusion_proof.key.index,
                hash: new Uint8Array(
                  Object.values(json.staking_tx_inclusion_proof.key.hash),
                ),
              },
              proof: new Uint8Array(
                Object.values(json.staking_tx_inclusion_proof.proof),
              ),
            }
          : undefined,
        slashingTx: new Uint8Array(Object.values(json.slashing_tx)),
        delegatorSlashingSig: new Uint8Array(
          Object.values(json.delegator_slashing_sig),
        ),
        unbondingTime: json.unbonding_time,
        unbondingTx: new Uint8Array(Object.values(json.unbonding_tx)),
        unbondingValue: json.unbonding_value,
        unbondingSlashingTx: new Uint8Array(
          Object.values(json.unbonding_slashing_tx),
        ),
        delegatorUnbondingSlashingSig: new Uint8Array(
          Object.values(json.delegator_unbonding_slashing_sig),
        ),
      };
    },
  },
};

const msgWithdrawRewardConverter = {
  [BBN_REGISTRY_TYPE_URLS.MsgWithdrawReward]: {
    aminoType: BBN_REGISTRY_TYPE_URLS.MsgWithdrawReward,
    toAmino: (msg: incentivetx.MsgWithdrawReward) => {
      return {
        type: msg.type,
        address: msg.address,
      };
    },
    fromAmino: (json: any): incentivetx.MsgWithdrawReward => {
      return {
        type: json.type,
        address: json.address,
      };
    },
  },
};

export const bbnAminoConverters = {
  ...msgCreateBTCDelegationConverter,
  ...msgWithdrawRewardConverter,
};

export function createBbnAminoTypes(): AminoTypes {
  return new AminoTypes({
    ...bbnAminoConverters,
  });
}
