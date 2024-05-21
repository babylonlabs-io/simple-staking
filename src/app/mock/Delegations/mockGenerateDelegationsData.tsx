import { Delegation } from "@/app/types/delegations";

function generateRandomHex(size: number) {
  return [...Array(size)]
    .map(() => Math.floor(Math.random() * 16).toString(16))
    .join("");
}

function getRandomState() {
  const states = ["completed", "active", "unbonding", "pending"];
  return states[Math.floor(Math.random() * states.length)];
}

export function generateRandomDelegationData(count: number) {
  const data: Delegation[] = [];

  for (let i = 0; i < count; i++) {
    const staking_value = Math.floor(Math.random() * 2000) + 1000; // Random value between 1000 and 3000
    const start_height = Math.floor(Math.random() * 20) + 10; // Random start height between 10 and 30
    const start_timestamp = Math.floor(Math.random() * 100000).toString(); // Random timestamp as string
    const is_overflow = Math.random() > 0.5; // Randomly true or false

    data.push({
      stakingTxHashHex: generateRandomHex(32),
      stakerPkHex: generateRandomHex(32),
      finalityProviderPkHex: generateRandomHex(32),
      state: getRandomState(),
      stakingValueSat: staking_value,
      stakingTx: {
        startHeight: start_height,
        startTimestamp: start_timestamp,
        txHex: generateRandomHex(32),
        outputIndex: 2,
        timelock: 1,
      },
      unbondingTx: {
        txHex: generateRandomHex(32),
        outputIndex: 2,
      },
      isOverflow: is_overflow,
    });
  }

  return data;
}
