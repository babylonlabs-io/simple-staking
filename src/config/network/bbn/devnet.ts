export const BBN_DEVNET_RPC_URL = process.env.NEXT_PUBLIC_BABY_RPC_URL
  ? process.env.NEXT_PUBLIC_BABY_RPC_URL
  : "https://rpc-dapp.devnet.babylonlabs.io/";

export const BBN_DEVNET_LCD_URL = process.env.NEXT_PUBLIC_BABY_LCD_URL
  ? process.env.NEXT_PUBLIC_BABY_LCD_URL
  : "https://lcd-dapp.devnet.babylonlabs.io/";

export const bbnDevnet = {
  chainId: "devnet-10",
  chainName: "Babylon Devnet 10",
  chainSymbolImageUrl:
    "https://raw.githubusercontent.com/babylonlabs-io/simple-staking/main/public/chain.png",
  rpc: BBN_DEVNET_RPC_URL,
  rest: BBN_DEVNET_LCD_URL,
  nodeProvider: {
    name: "Babylonlabs",
    email: "contact@babylonlabs.io",
    website: "https://babylonlabs.io/",
  },
  bip44: {
    coinType: 118,
  },
  bech32Config: {
    bech32PrefixAccAddr: "bbn",
    bech32PrefixAccPub: "bbnpub",
    bech32PrefixValAddr: "bbnvaloper",
    bech32PrefixValPub: "bbnvaloperpub",
    bech32PrefixConsAddr: "bbnvalcons",
    bech32PrefixConsPub: "bbnvalconspub",
  },
  currencies: [
    {
      coinDenom: "BABY",
      coinMinimalDenom: "ubbn",
      coinDecimals: 6,
      coinImageUrl:
        "https://raw.githubusercontent.com/babylonlabs-io/simple-staking/main/public/chain.png",
    },
  ],
  feeCurrencies: [
    {
      coinDenom: "BABY",
      coinMinimalDenom: "ubbn",
      coinDecimals: 6,
      coinImageUrl:
        "https://raw.githubusercontent.com/babylonlabs-io/simple-staking/main/public/chain.png",
      gasPriceStep: {
        low: 0.007,
        average: 0.007,
        high: 0.01,
      },
    },
  ],
  stakeCurrency: {
    coinDenom: "BABY",
    coinMinimalDenom: "ubbn",
    coinDecimals: 6,
    coinImageUrl:
      "https://raw.githubusercontent.com/babylonlabs-io/simple-staking/main/public/chain.png",
  },
  features: ["cosmwasm"],
};
