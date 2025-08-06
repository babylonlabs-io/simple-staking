export const mockDelegation = {
  finality_provider_btc_pks_hex: [
    "0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798",
  ],
  params_version: 0,
  staker_btc_pk_hex:
    "02c6047f9441ed7d6d3045406e95c07cd85c778e4b8cef3ca7abac09b95c709ee5",
  delegation_staking: {
    staking_tx_hex: "00",
    staking_tx_hash_hex: "hash",
    staking_timelock: 0,
    staking_amount: 9876543,
    start_height: 0,
    end_height: 0,
    bbn_inception_height: 0,
    bbn_inception_time: new Date().toISOString(),
    slashing: {
      slashing_tx_hex: "",
      spending_height: 0,
    },
  },
  delegation_unbonding: {
    unbonding_timelock: 0,
    unbonding_tx: "",
    slashing: {
      unbonding_slashing_tx_hex: "",
      spending_height: 0,
    },
  },
  state: "ACTIVE",
};

export const mockNetworkInfo = {
  data: {
    staking_status: {
      is_staking_open: true,
      staking_expansion_allow_list: {
        is_expired: false,
      },
    },
    params: {
      bbn: [
        {
          version: 0,
          covenant_pks: [
            "0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798",
            "02c6047f9441ed7d6d3045406e95c07cd85c778e4b8cef3ca7abac09b95c709ee5",
            "02f9308a019258c31049344f85f89d5229b531c845836f99b08601f113bce036f9",
          ],
          covenant_quorum: 2,
          min_staking_value_sat: 100000,
          max_staking_value_sat: 1000000,
          min_staking_time_blocks: 144,
          max_staking_time_blocks: 1440,
          slashing_pk_script:
            "76a914c96e00cdddfe208629638e394358b2770e636b2388ac",
          min_slashing_tx_fee_sat: 1000,
          slashing_rate: "0.1",
          unbonding_time_blocks: 144,
          unbonding_fee_sat: 2000,
          min_commission_rate: "0.05",
          max_active_finality_providers: 10,
          delegation_creation_base_gas_fee: 50000,
          btc_activation_height: 100,
          allow_list_expiration_height: 200,
        },
        {
          version: 1,
          covenant_pks: [
            "0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798",
            "02c6047f9441ed7d6d3045406e95c07cd85c778e4b8cef3ca7abac09b95c709ee5",
            "02f9308a019258c31049344f85f89d5229b531c845836f99b08601f113bce036f9",
          ],
          covenant_quorum: 3,
          min_staking_value_sat: 150000,
          max_staking_value_sat: 1500000,
          min_staking_time_blocks: 288,
          max_staking_time_blocks: 2880,
          slashing_pk_script:
            "76a914c96e00cdddfe208629638e394358b2770e636b2388ac",
          min_slashing_tx_fee_sat: 1500,
          slashing_rate: "0.15",
          unbonding_time_blocks: 288,
          unbonding_fee_sat: 3000,
          min_commission_rate: "0.1",
          max_active_finality_providers: 15,
          delegation_creation_base_gas_fee: 60000,
          btc_activation_height: 200,
          allow_list_expiration_height: 300,
        },
      ],
      btc: [
        {
          version: 0,
          btc_confirmation_depth: 6,
        },
        {
          version: 1,
          btc_confirmation_depth: 12,
        },
      ],
    },
  },
};

// Common mock values used across handlers
export const MOCK_VALUES = {
  BBN_BALANCE: "1000000",
  STAKABLE_BTC: "74175",
  STAKED_BTC: "9876543",
  REWARDS: "500000",
};
