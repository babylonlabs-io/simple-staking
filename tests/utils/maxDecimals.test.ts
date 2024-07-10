import { maxDecimals } from "@/utils/maxDecimals";

describe("maxDecimals", () => {
  it("should limit the number of decimal places to 2", () => {
    expect(maxDecimals(3.14159, 2)).toBe(3.14);
  });

  it("should round correctly to 2 decimal places", () => {
    expect(maxDecimals(1.005, 2)).toBe(1.01);
  });

  it("should return an integer when maxDecimals is 0", () => {
    expect(maxDecimals(10, 0)).toBe(10);
  });

  it("should return the number itself if the number of decimal places is less than or equal to maxDecimals", () => {
    expect(maxDecimals(3.141, 3)).toBe(3.141);
    expect(maxDecimals(3.149, 3)).toBe(3.149);
  });

  it("should handle negative numbers correctly", () => {
    expect(maxDecimals(-3.14159, 2)).toBe(-3.14);
    expect(maxDecimals(-1.005, 2)).toBe(-1.01);
  });

  it("should handle zero correctly", () => {
    expect(maxDecimals(0, 2)).toBe(0);
    expect(maxDecimals(0.0, 2)).toBe(0);
  });
});
