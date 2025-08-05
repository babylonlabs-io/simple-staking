import babylon from "@/infrastructure/babylon";

interface StakeParams {
  delegatorAddress: string;
  validatorAddress: string;
  /** Amount in ubbn (1e6 = 1 BABY). Accepts bigint or numeric string */
  amount: bigint | string | number;
}

/**
 * Build and sign a stake transaction, returning the broadcast result.
 */
export async function stake(
  params: StakeParams,
  signAndBroadcast: (msgs: any | any[]) => Promise<any>,
): Promise<any> {
  const { delegatorAddress, validatorAddress, amount } = params;

  const msg = babylon.txs.baby.createStakeMsg({
    delegatorAddress,
    validatorAddress,
    amount:
      typeof amount === "bigint"
        ? amount
        : babylon.utils.babyToUbbn(Number(amount)),
  });

  return signAndBroadcast(msg);
}

export async function unstake(
  params: StakeParams,
  signAndBroadcast: (msgs: any | any[]) => Promise<any>,
): Promise<any> {
  const { delegatorAddress, validatorAddress, amount } = params;

  const msg = babylon.txs.baby.createUnstakeMsg({
    delegatorAddress,
    validatorAddress,
    amount:
      typeof amount === "bigint"
        ? amount
        : babylon.utils.babyToUbbn(Number(amount)),
  });

  return signAndBroadcast(msg);
}

export async function estimateStakeFee(
  params: StakeParams,
  estimateGas: (msgs: any | any[]) => Promise<{ amount: { amount: string }[] }>,
): Promise<number> {
  const { delegatorAddress, validatorAddress, amount } = params;

  const msg = babylon.txs.baby.createStakeMsg({
    delegatorAddress,
    validatorAddress,
    amount: babylon.utils.babyToUbbn(Number(amount)),
  });
  const res = await estimateGas(msg);
  return res.amount.reduce((sum, { amount }) => sum + Number(amount), 0);
}
