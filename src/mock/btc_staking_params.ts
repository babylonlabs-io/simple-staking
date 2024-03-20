export interface BtcStakingParams {
  covenant_pks: string[];
  covenant_quorum: number;
  slashing_rate: string;
  slashing_address: string;
  min_slashing_tx_fee_sat: number;
  min_commission_rate: string;
  max_active_finality_providers: number;
  min_unbonding_time: number;
}

export const data = {
  covenant_pks: [
    // "ffeaec52a9b407b355ef6967a7ffc15fd6c3fe07de2844d61550475e7a5233e5",
    // "a5c60c2188e833d39d0fa798ab3f69aa12ed3dd2f3bad659effa252782de3c31",
    // "59d3532148a597a2d05c0395bf5f7176044b1cd312f37701a9b4d0aad70bc5a4",
    // "57349e985e742d5131e1e2b227b5170f6350ac2e2feb72254fcc25b3cee21a18",
    // "c8ccb03c379e452f10c81232b41a1ca8b63d0baf8387e57d302c987e5abb8527",
    "0033f0321bbf728701334f583174548b314e529e2e13cb8ef715871b154d49dc",
  ],
  // covenant_quorum: 3,
  covenant_quorum: 1,
  slashing_rate: "0.100000000000000000",
  slashing_address: "tb1qv03wm7hxhag6awldvwacy0z42edtt6kwljrhd9",
  min_slashing_tx_fee_sat: 1000,
  min_commission_rate: "0.050000000000000000",
  max_active_finality_providers: 80,
  min_unbonding_time: 100,
};
