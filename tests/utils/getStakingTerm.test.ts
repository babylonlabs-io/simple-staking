import { getStakingTerm } from "@/utils/getStakingTerm";

describe("getStakingTerm", () => {
  it("should return the fixed term when minStakingTimeBlocks equals maxStakingTimeBlocks", () => {
    const params: any = {
      minStakingTimeBlocks: 100,
      maxStakingTimeBlocks: 100,
    };
    const term = 50;
    expect(getStakingTerm(params, term)).toBe(100);
  });

  it("should return the input term when minStakingTimeBlocks does not equal maxStakingTimeBlocks", () => {
    const params: any = {
      minStakingTimeBlocks: 100,
      maxStakingTimeBlocks: 200,
    };
    const term = 150;
    expect(getStakingTerm(params, term)).toBe(term);
  });

  it("should return the input term when params is undefined", () => {
    const params = undefined;
    const term = 150;
    expect(getStakingTerm(params as any, term)).toBe(term);
  });

  it("should return the input term when params is null", () => {
    const params = null;
    const term = 150;
    expect(getStakingTerm(params as any, term)).toBe(term);
  });
});
