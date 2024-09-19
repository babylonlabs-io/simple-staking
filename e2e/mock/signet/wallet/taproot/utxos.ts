import { UTXO } from "@/utils/wallet/wallet_provider";

export const taprootSignetBalance = 70000;

export const taprootSignetUTXOs: UTXO[] = [
  {
    txid: "b55e626c45bcf3dd1c6fc50fbe3046c3a332e6e0a819776bf3850277fc792c05",
    vout: 0,
    value: taprootSignetBalance,
    scriptPubKey:
      "5120c28a37fa80c20816185d046ba3be168e42e644c3072a99da16183306ea8d2924",
  },
];
