export function satoshiToBtc(satoshi: number): number {
    return satoshi / 1e8;
}

export function btcToSatoshi(btc: number): number {
    return btc * 1e8;
}