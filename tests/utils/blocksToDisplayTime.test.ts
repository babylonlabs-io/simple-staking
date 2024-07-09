import { blocksToDisplayTime } from "@/utils/blocksToDisplayTime";

describe("blocksToDisplayTime", () => {
  it("should return '-' if block is 0", () => {
    expect(blocksToDisplayTime(0)).toBe("-");
  });

  it("should convert 1 block to 1 day", () => {
    expect(blocksToDisplayTime(1)).toBe("1 day");
  });

  it("should convert 200 blocks to 2 days", () => {
    expect(blocksToDisplayTime(200)).toBe("2 days");
  });

  it("should convert 900 blocks to 7 days", () => {
    expect(blocksToDisplayTime(900)).toBe("7 days");
  });

  it("should convert 30000 blocks to 30 weeks", () => {
    expect(blocksToDisplayTime(30000)).toBe("30 weeks");
  });

  it("should convert 4320 blocks to 5 weeks", () => {
    expect(blocksToDisplayTime(4320)).toBe("5 weeks");
  });

  it("should convert 63000 blocks to 65 weeks", () => {
    expect(blocksToDisplayTime(63000)).toBe("65 weeks");
  });
});
