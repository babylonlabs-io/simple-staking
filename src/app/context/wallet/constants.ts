import { Fees, Network } from "@babylonlabs-io/bbn-wallet-connect";

import { BTCWalletContext, CosmosWalletContext } from "./types";

export const btcDefaultContext: BTCWalletContext = {
  network: undefined,
  connected: false,
  publicKeyNoCoord: "",
  address: "",
  disconnect: () => {},
  open: () => {},
  getAddress: async () => "",
  getPublicKeyHex: async () => "",
  signPsbt: async () => "",
  signPsbts: async () => [],
  getNetwork: async () => ({}) as Network,
  signMessage: async () => "",
  getBalance: async () => 0,
  getNetworkFees: async () => ({}) as Fees,
  pushTx: async () => "",
  getUtxos: async () => [],
  getBTCTipHeight: async () => 0,
  getInscriptions: async () => [],
};

export const bbnDefaultContext: CosmosWalletContext = {
  bech32Address: "",
  connected: false,
  disconnect: () => {},
  open: () => {},
  signingStargateClient: null,
};
