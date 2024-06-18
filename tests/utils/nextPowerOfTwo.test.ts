import { nextPowerOfTwo } from "@/utils/nextPowerOfTwo";

describe("nextPowerOfTwo", () => {
  it("should convert negative numbers to 2", () => {
    expect(nextPowerOfTwo(-1)).toBe(2);
    expect(nextPowerOfTwo(-100)).toBe(2);
  });

  it("should convert 0 to 2", () => {
    expect(nextPowerOfTwo(0)).toBe(2);
  });

  it("should convert 1 to 4", () => {
    expect(nextPowerOfTwo(1)).toBe(4);
  });

  it("should convert 2 to 4", () => {
    expect(nextPowerOfTwo(2)).toBe(4);
  });

  it("should convert 5 to 16", () => {
    expect(nextPowerOfTwo(5)).toBe(16);
  });

  it("should convert 250 to 512", () => {
    expect(nextPowerOfTwo(250)).toBe(512);
  });

  it("should convert 1023 to 2048", () => {
    expect(nextPowerOfTwo(1023)).toBe(2048);
  });
});
