import { Delegation } from "./getDelegations";

interface Delegations {
  data: Delegation[];
  pagination: Pagination;
}
interface Pagination {
  next_key: string;
}

export const getDelegationsMock = async (
  key: string,
  publicKeyNoCoord?: string,
): Promise<MockDelegationData> => {
  if (!publicKeyNoCoord) {
    throw new Error("No public key provided");
  }

  // params
  const limit = 10;
  const reverse = false;

  await new Promise((resolve) => setTimeout(resolve, 5000)); // 5 second delay

  return generateMockDelegations(key, limit);
};

interface MockDelegationData {
  data: Delegation[];
  pagination: Pagination;
}

function generateMockDelegations(
  key: string,
  limit: number,
): MockDelegationData {
  const startIndex = parseInt(key, 10) || 0;
  const delegations: Delegation[] = [];

  for (let i = startIndex; i < startIndex + limit; i++) {
    delegations.push({
      staking_tx_hash_hex: `hash_${i}`,
      staker_pk_hex: `pk_${i}`,
      finality_provider_pk_hex: `fpk_${i}`,
      state: "active",
      staking_value: Math.floor(Math.random() * 1000) + 100,
      staking_tx: {
        tx_hex: `txhex_${i}`,
        output_index: i,
        start_timestamp: new Date().toISOString(),
        start_height: 1000 + i,
        timelock: 500 + i,
      },
      unbonding_tx:
        i % 2 === 0
          ? {
              tx_hex: `utxhex_${i}`,
              output_index: i,
            }
          : undefined,
    });
  }

  return {
    data: delegations,
    pagination: {
      next_key: (startIndex + limit).toString(),
    },
  };
}

