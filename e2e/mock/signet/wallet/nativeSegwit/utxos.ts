import { UTXO } from "@/utils/wallet/wallet_provider";

export const nativeSegwitSignetBalance = 70000;

export const nativeSegwitSignetUTXOs: UTXO[] = [
  {
    txid: "ef7676d05617377c42414aad07429c053d5f52eb5d0ac3fa3d2d9cf30f6186c3",
    vout: 0,
    value: nativeSegwitSignetBalance,
    scriptPubKey: "00141c038d85d7ad9f437d3f37920151bb4056fd248d",
  },
];
