/**
 * Mock data for networkInfo API tests
 */

export const mockSuccessResponse = {
  data: {
    params: {
      bbn: [
        {
          version: 0, // Genesis version
          covenant_pks: ["pk1", "pk2", "pk3"],
          covenant_quorum: 2,
          min_staking_value_sat: 100000,
          max_staking_value_sat: 1000000,
          min_staking_time_blocks: 144,
          max_staking_time_blocks: 1440,
          slashing_pk_script: "slashingScript",
          min_slashing_tx_fee_sat: 1000,
          slashing_rate: "0.1",
          unbonding_time_blocks: 144,
          unbonding_fee_sat: 2000,
          min_commission_rate: "0.05",
          max_finality_providers: 10,
          delegation_creation_base_gas_fee: 50000,
          btc_activation_height: 100,
          allow_list_expiration_height: 200,
        },
        {
          version: 1, // Latest version
          covenant_pks: ["pk4", "pk5", "pk6"],
          covenant_quorum: 3,
          min_staking_value_sat: 150000,
          max_staking_value_sat: 1500000,
          min_staking_time_blocks: 288,
          max_staking_time_blocks: 2880,
          slashing_pk_script: "slashingScript2",
          min_slashing_tx_fee_sat: 1500,
          slashing_rate: "0.15",
          unbonding_time_blocks: 288,
          unbonding_fee_sat: 3000,
          min_commission_rate: "0.1",
          max_finality_providers: 15,
          delegation_creation_base_gas_fee: 60000,
          btc_activation_height: 200,
          allow_list_expiration_height: 300,
        },
      ],
      btc: [
        {
          version: 0, // Genesis version
          btc_confirmation_depth: 6,
        },
        {
          version: 1, // Latest version
          btc_confirmation_depth: 12,
        },
      ],
    },
  },
};
