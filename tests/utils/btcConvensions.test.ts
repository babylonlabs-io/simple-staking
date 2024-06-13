import { btcToSatoshi, satoshiToBtc } from "@/utils/btcConversions";

describe("satoshiToBtc", () => {
  it("should convert 0 satoshis to 0 BTC", () => {
    expect(satoshiToBtc(0)).toBe(0);
  });

  it("should convert 100,000,000 satoshis to 1 BTC", () => {
    expect(satoshiToBtc(100000000)).toBe(1);
  });

  it("should convert 50,000,000 satoshis to 0.5 BTC", () => {
    expect(satoshiToBtc(50000000)).toBe(0.5);
  });

  it("should handle negative values", () => {
    expect(satoshiToBtc(-100000000)).toBe(-1);
  });
});

describe("btcToSatoshi", () => {
  it("should convert 0 BTC to 0 satoshis", () => {
    expect(btcToSatoshi(0)).toBe(0);
  });

  it("should convert 1 BTC to 100,000,000 satoshis", () => {
    expect(btcToSatoshi(1)).toBe(100000000);
  });

  it("should convert 0.5 BTC to 50,000,000 satoshis", () => {
    expect(btcToSatoshi(0.5)).toBe(50000000);
  });

  it("should handle negative values", () => {
    expect(btcToSatoshi(-1)).toBe(-100000000);
  });

  it("should round to the nearest satoshi", () => {
    expect(btcToSatoshi(0.123456789)).toBe(12345679);
    expect(btcToSatoshi(0.123456781)).toBe(12345678);
  });
});
