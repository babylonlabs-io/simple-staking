export const BBN_DEVNET_RPC_URL = "https://rpc-dapp.devnet.babylonlabs.io";
export const BBN_DEVNET_LCD_URL = "https://lcd-dapp.devnet.babylonlabs.io";

export const bbnDevnet = {
  chainId: "devnet-9",
  chainName: "Babylon Devnet 9",
  chainSymbolImageUrl:
    "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/bbn-dev/chain.png",
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
        "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/bbn-dev/chain.png",
    },
  ],
  feeCurrencies: [
    {
      coinDenom: "BABY",
      coinMinimalDenom: "ubbn",
      coinDecimals: 6,
      coinImageUrl:
        "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/bbn-dev/chain.png",
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
      "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/bbn-dev/chain.png",
  },
  features: ["cosmwasm"],
};
