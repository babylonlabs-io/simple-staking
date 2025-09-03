import { getUrlFromEnv } from "./urlUtils";

export const BSN_DEVNET_RPC_URL = getUrlFromEnv(
  process.env.NEXT_PUBLIC_BABY_RPC_URL,
  "http://localhost:3000",
  "https://rpc.bsn-devnet.babylonlabs.io",
);

export const BSN_DEVNET_LCD_URL = getUrlFromEnv(
  process.env.NEXT_PUBLIC_BABY_LCD_URL,
  "http://localhost:1317",
  "https://lcd.bsn-devnet.babylonlabs.io",
);

export const bbnBsnDevnet = {
  chainId: "bsn-devnet-1",
  chainName: "Babylon BSN Devnet 1",
  chainSymbolImageUrl:
    "https://raw.githubusercontent.com/babylonlabs-io/simple-staking/main/public/chain.png",
  rpc: BSN_DEVNET_RPC_URL,
  rest: BSN_DEVNET_LCD_URL,
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
