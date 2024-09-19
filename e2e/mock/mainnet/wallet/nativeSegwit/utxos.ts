import { UTXO } from "@/utils/wallet/wallet_provider";

export const nativeSegwitMainnetBalance = 67069;

export const nativeSegwitMainnetUTXOs: UTXO[] = [
  {
    txid: "c7a412ab3cfe948921eb3fcac120cba251a7db053a2bf57013fc7df5924148b4",
    vout: 0,
    value: nativeSegwitMainnetBalance,
    scriptPubKey: "0014f39e559d1f3d71eb4390a4d711ab2878326b14fe",
  },
];
