import {
  btcstaking,
  btcstakingtx,
  incentivetx,
} from "@babylonlabs-io/babylon-proto-ts";
import { AminoTypes } from "@cosmjs/stargate";

import { BBN_REGISTRY_TYPE_URLS } from "./bbnRegistry";

const msgCreateBTCDelegationConverter = {
  [BBN_REGISTRY_TYPE_URLS.MsgCreateBTCDelegation]: {
    aminoType: BBN_REGISTRY_TYPE_URLS.MsgCreateBTCDelegation,
    //
    // 1) Protobuf -> Amino JSON
    //
    toAmino: (msg: btcstakingtx.MsgCreateBTCDelegation) => {
      console.log("toAmino", msg);
      console.log(
        "msg.pop.btcSig",
        Buffer.from(msg?.pop?.btcSig).toString("hex"),
      );
      console.log("btc_pk", Buffer.from(msg.btcPk).toString("hex"));
      return {
        staker_addr: msg.stakerAddr,
        pop: msg.pop
          ? {
              btc_sig_type: msg.pop.btcSigType.toString(),
              btc_sig: Buffer.from(msg.pop.btcSig).toString("hex"),
            }
          : undefined,
        btc_pk: Buffer.from(msg.btcPk).toString("hex"),
        fp_btc_pk_list: msg.fpBtcPkList.map((pk) =>
          Buffer.from(pk).toString("hex"),
        ),
        staking_time: msg.stakingTime.toString(),
        staking_value: msg.stakingValue.toString(),
        staking_tx: Buffer.from(msg.stakingTx).toString("hex"),
        staking_tx_inclusion_proof: msg.stakingTxInclusionProof
          ? {
              key: msg.stakingTxInclusionProof.key
                ? {
                    index: msg.stakingTxInclusionProof.key.index.toString(),
                    hash: Buffer.from(
                      msg.stakingTxInclusionProof.key.hash,
                    ).toString("hex"),
                  }
                : undefined,
              proof: Buffer.from(msg.stakingTxInclusionProof.proof).toString(
                "hex",
              ),
            }
          : undefined,
        slashing_tx: Buffer.from(msg.slashingTx).toString("hex"),
        delegator_slashing_sig: Buffer.from(msg.delegatorSlashingSig).toString(
          "hex",
        ),
        unbonding_time: msg.unbondingTime.toString(),
        unbonding_tx: Buffer.from(msg.unbondingTx).toString("hex"),
        unbonding_value: msg.unbondingValue.toString(),
        unbonding_slashing_tx: Buffer.from(msg.unbondingSlashingTx).toString(
          "hex",
        ),
        delegator_unbonding_slashing_sig: Buffer.from(
          msg.delegatorUnbondingSlashingSig,
        ).toString("hex"),
      };
    },

    //
    // 2) Amino JSON -> Protobuf
    //
    fromAmino: (json: any): btcstakingtx.MsgCreateBTCDelegation => {
      console.log("fromAmino", json);
      console.log("json.pop.btc_sig", json.pop.btc_sig);
      console.log(
        "json.pop.btc_sign buf",
        Buffer.from(json.pop.btc_sig, "hex"),
      );
      console.log("json.btc_pk", json.btc_pk);
      console.log("json.btc_pk buf", Buffer.from(json.btc_pk, "hex"));

      return {
        stakerAddr: json.staker_addr,
        pop: json.pop
          ? {
              btcSigType: parseInt(json.pop.btc_sig_type, 10),
              btcSig: Buffer.from(json.pop.btc_sig, "hex"),
            }
          : undefined,
        btcPk: Buffer.from(json.btc_pk, "hex"),
        fpBtcPkList: (json.fp_btc_pk_list || []).map((pk: string) =>
          Buffer.from(pk, "hex"),
        ),
        stakingTime: parseInt(json.staking_time, 10),
        stakingValue: parseInt(json.staking_value, 10),
        stakingTx: Buffer.from(json.staking_tx, "hex"),
        stakingTxInclusionProof: json.staking_tx_inclusion_proof
          ? btcstaking.InclusionProof.fromPartial({
              key: json.staking_tx_inclusion_proof.key
                ? {
                    index: parseInt(
                      json.staking_tx_inclusion_proof.key.index,
                      10,
                    ),
                    hash: Buffer.from(
                      json.staking_tx_inclusion_proof.key.hash,
                      "hex",
                    ),
                  }
                : undefined,
              proof: Buffer.from(json.staking_tx_inclusion_proof.proof, "hex"),
            })
          : undefined,
        slashingTx: Buffer.from(json.slashing_tx, "hex"),
        delegatorSlashingSig: Buffer.from(json.delegator_slashing_sig, "hex"),
        unbondingTime: parseInt(json.unbonding_time, 10),
        unbondingTx: Buffer.from(json.unbonding_tx, "hex"),
        unbondingValue: parseInt(json.unbonding_value, 10),
        unbondingSlashingTx: Buffer.from(json.unbonding_slashing_tx, "hex"),
        delegatorUnbondingSlashingSig: Buffer.from(
          json.delegator_unbonding_slashing_sig,
          "hex",
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
