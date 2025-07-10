export type Fees = {
  // fee for inclusion in the next block
  fastestFee: number;
  // fee for inclusion in a block in 30 mins
  halfHourFee: number;
  // fee for inclusion in a block in 1 hour
  hourFee: number;
  // economy fee: inclusion not guaranteed
  economyFee: number;
  // minimum fee: the minimum fee of the network
  minimumFee: number;
};
