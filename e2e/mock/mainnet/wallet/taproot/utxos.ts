import { UTXO } from "@/utils/wallet/wallet_provider";

export const taprootMainnetBalance = 70837;

export const taprootMainnetUTXOs: UTXO[] = [
  {
    txid: "91edc90dcd160eec7d38f672e28847138cf5f37259c81128029359f7011d58c5",
    vout: 0,
    value: taprootMainnetBalance,
    scriptPubKey:
      "5120d29e6535ee61312793d2de1ff311767ef5583b0657c358bd035cdf6f81dc4071",
  },
];
