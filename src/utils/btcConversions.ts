// should be used internally in the app
export function satoshiToBtc(satoshi: number): number {
  return satoshi / 1e8;
}

// should be used only in the UI
export function btcToSatoshi(btc: number): number {
  return Math.round(btc * 1e8);
}
