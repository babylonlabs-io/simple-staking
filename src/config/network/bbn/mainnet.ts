export const BBN_MAINNET_RPC_URL = process.env.NEXT_PUBLIC_BABY_RPC_URL
  ? process.env.NEXT_PUBLIC_BABY_RPC_URL
  : "https://rpc-dapp.babylonlabs.io/";

export const BBN_MAINNET_LCD_URL = process.env.NEXT_PUBLIC_BABY_LCD_URL
  ? process.env.NEXT_PUBLIC_BABY_LCD_URL
  : "https://lcd-dapp.babylonlabs.io/";

export const bbnMainnet = {
  chainId: "bbn-1",
  chainName: "Babylon Genesis",
  chainSymbolImageUrl:
    "https://raw.githubusercontent.com/babylonlabs-io/simple-staking/main/public/chain.png",
  rpc: BBN_MAINNET_RPC_URL,
  rest: BBN_MAINNET_LCD_URL,
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
        low: 0.005,
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
