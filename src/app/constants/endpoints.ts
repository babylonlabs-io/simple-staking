export const API_ENDPOINTS = {
  NETWORK_INFO: "/v2/network-info",

  DELEGATION_V2: "/v2/delegation",
  DELEGATIONS_V2: "/v2/delegations",
  HEALTHCHECK: "/healthcheck",
  FINALITY_PROVIDERS: "/v1/finality-providers",
  STAKER_DELEGATIONS: "/v1/staker/delegations",

  // Mempool API paths
  MEMPOOL: {
    TX: "tx",
    ADDRESS: "address",
    BLOCKS_TIP_HEIGHT: "blocks/tip/height",
    FEES_RECOMMENDED: "v1/fees/recommended",
    VALIDATE_ADDRESS: "v1/validate-address",
    MERKLE_PROOF: "merkle-proof",
    HEX: "hex",
    TX_INFO: "tx/info",
  },
} as const;
