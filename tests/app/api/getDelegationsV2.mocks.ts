export const mockSingleDelegationResponse = {
  data: {
    data: {
      finality_provider_btc_pks_hex: ["pk1", "pk2"],
      params_version: 1,
      staker_btc_pk_hex: "stakerPk",
      can_expand: true,
      state: "ACTIVE",
      delegation_staking: {
        staking_tx_hex: "txHex123",
        staking_tx_hash_hex: "mockTxHash123",
        staking_timelock: 1440,
        staking_amount: 1000000,
        start_height: 100000,
        end_height: 200000,
        bbn_inception_height: 50000,
        bbn_inception_time: "2023-01-01T00:00:00Z",
        slashing: {
          slashing_tx_hex: "",
          spending_height: 0,
        },
      },
      delegation_unbonding: {
        unbonding_timelock: 0,
        unbonding_tx: "",
        covenant_unbonding_signatures: [],
        slashing: {
          unbonding_slashing_tx_hex: "",
          spending_height: 0,
        },
      },
    },
  },
};

export const mockPaginatedResponse = {
  data: {
    data: [
      {
        finality_provider_btc_pks_hex: ["pk1", "pk2"],
        params_version: 1,
        staker_btc_pk_hex: "stakerPk1",
        can_expand: true,
        state: "ACTIVE",
        delegation_staking: {
          staking_tx_hex: "txHex1",
          staking_tx_hash_hex: "mockTxHash1",
          staking_timelock: 1440,
          staking_amount: 1000000,
          start_height: 100000,
          end_height: 200000,
          bbn_inception_height: 50000,
          bbn_inception_time: "2023-01-01T00:00:00Z",
          slashing: {
            slashing_tx_hex: "",
            spending_height: 0,
          },
        },
        delegation_unbonding: {
          unbonding_timelock: 0,
          unbonding_tx: "",
          covenant_unbonding_signatures: [],
          slashing: {
            unbonding_slashing_tx_hex: "",
            spending_height: 0,
          },
        },
      },
      {
        finality_provider_btc_pks_hex: ["pk3", "pk4"],
        params_version: 1,
        staker_btc_pk_hex: "stakerPk2",
        can_expand: false,
        state: "TIMELOCK_UNBONDING",
        delegation_staking: {
          staking_tx_hex: "txHex2",
          staking_tx_hash_hex: "mockTxHash2",
          staking_timelock: 2880,
          staking_amount: 2000000,
          start_height: 110000,
          end_height: 210000,
          bbn_inception_height: 60000,
          bbn_inception_time: "2023-02-01T00:00:00Z",
          slashing: {
            slashing_tx_hex: "",
            spending_height: 0,
          },
        },
        delegation_unbonding: {
          unbonding_timelock: 144,
          unbonding_tx: "unbondingTxHex",
          covenant_unbonding_signatures: [
            {
              covenant_btc_pk_hex: "covenantPk",
              signature_hex: "sigHex",
            },
          ],
          slashing: {
            unbonding_slashing_tx_hex: "",
            spending_height: 0,
          },
        },
      },
    ],
    pagination: {
      next_key: "nextPageKey123",
    },
  },
};
