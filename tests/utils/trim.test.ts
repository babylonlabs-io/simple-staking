import { trim } from "@/utils/trim";

describe("trim", () => {
  const txHashHex =
    "5f43cba06bfd354ad6777d7839b6d2e65871c1ca5c2df2c10468b3f60978e8cb";

  it("should trim transaction hash correctly", () => {
    expect(trim(txHashHex, 8)).toBe("5f43...e8cb");
  });

  it("should trim btc address correctly", () => {
    const btcAddress = "bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq";
    expect(trim(btcAddress, 8)).toBe("bc1q...5mdq");
  });

  it("should trim the string correctly with an odd number of symbols", () => {
    expect(trim(txHashHex, 7)).toBe("5f4...8cb");
  });

  it("should return original string if nothing to trim", () => {
    expect(trim("abc", 8)).toBe("abc");
  });

  it("should handle undefined input", () => {
    expect(trim(undefined)).toBeUndefined();
  });

  it("should throw error for negative symbols", () => {
    expect(() => trim("abc", -1)).toThrow("Symbols count cannot be negative");
  });

  it("should handle empty string", () => {
    expect(trim("", 8)).toBe("");
  });
});
