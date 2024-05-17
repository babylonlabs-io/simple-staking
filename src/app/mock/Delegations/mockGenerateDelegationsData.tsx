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
  const data = [];

  for (let i = 0; i < count; i++) {
    const staking_value = Math.floor(Math.random() * 2000) + 1000; // Random value between 1000 and 3000
    const start_height = Math.floor(Math.random() * 20) + 10; // Random start height between 10 and 30
    const start_timestamp = Math.floor(Math.random() * 100000).toString(); // Random timestamp as string
    const is_overflow = Math.random() > 0.5; // Randomly true or false

    data.push({
      staking_tx_hash_hex: generateRandomHex(32),
      staker_pk_hex: generateRandomHex(32),
      finality_provider_pk_hex: generateRandomHex(32),
      state: getRandomState(),
      staking_value: staking_value,
      staking_tx: {
        id: i + 1,
        date: `2024-${Math.floor(Math.random() * 12 + 1)
          .toString()
          .padStart(2, "0")}-${Math.floor(Math.random() * 28 + 1)
          .toString()
          .padStart(2, "0")}`,
        amount: staking_value,
        start_height: start_height,
        start_timestamp: start_timestamp,
        tx_hex: generateRandomHex(32),
        output_index: 2,
        timelock: 1,
      },
      is_overflow: is_overflow,
    });
  }

  return data;
}
