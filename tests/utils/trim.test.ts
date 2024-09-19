import { trim } from "@/utils/trim";

describe("trim", () => {
  const txHashHex =
    "5f43cba06bfd354ad6777d7839b6d2e65871c1ca5c2df2c10468b3f60978e8cb";
  it("should trim transaction hash correctly", () => {
    expect(trim(txHashHex)).toBe("5f43...e8cb");
  });

  it("should trim btc address correctly", () => {
    const btcAddress = "bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq";
    expect(trim(btcAddress)).toBe("bc1q...5mdq");
  });

  it("should trim the string correctly with an odd number of symbols", () => {
    expect(trim(txHashHex, 7)).toBe("5f4...8cb");
  });

  it("should return original string if nothing to trim", () => {
    expect(trim("abc")).toBe("abc");
  });

  it("should return empty string for empty string", () => {
    expect(trim("")).toBe("");
  });

  it("should handle cases where symbols count is 0", () => {
    expect(trim("abc", 0)).toBe("...");
  });
});
