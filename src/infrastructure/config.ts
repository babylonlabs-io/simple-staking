export default {
  api: {
    baseUrl:
      process.env.NEXT_PUBLIC_API_URL ??
      "https://staking-api.phase-2-devnet.babylonlabs.io",
  },
  bitcoin: {
    url: process.env.NEXT_PUBLIC_MEMPOOL_API ?? "https://mempool.space",
    network: process.env.NEXT_PUBLIC_NETWORK ?? "signet",
  },
  babylon: {
    rpcUrl:
      process.env.NEXT_PUBLIC_BABY_RPC_URL ??
      "https://rpc-dapp.devnet.babylonlabs.io/",
  },
} satisfies Infra.Config;
