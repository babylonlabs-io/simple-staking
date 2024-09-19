import { satoshiToBtc } from "@/utils/btcConversions";

export const STAKING_AMOUNT_SAT = 50000;
export const STAKING_AMOUNT_BTC = satoshiToBtc(STAKING_AMOUNT_SAT);
export const STAKING_DURATION_BLOCKS = 150;
