import { getIntermediateDelegationsLocalStorageKey } from "@/utils/local_storage/getIntermediateDelegationsLocalStorageKey";

describe("utils/local_storage/getIntermediateDelegationsLocalStorageKey", () => {
  it("should return the correct key when pk is provided", () => {
    const pk = "someRandomKey";
    const expectedKey = "bbn-staking-intermediate-delegations-someRandomKey";
    expect(getIntermediateDelegationsLocalStorageKey(pk)).toBe(expectedKey);
  });

  it("should return an empty string when pk is an empty string", () => {
    const pk = "";
    expect(getIntermediateDelegationsLocalStorageKey(pk)).toBe("");
  });

  it("should return an empty string when pk is null", () => {
    const pk: any = null;
    expect(getIntermediateDelegationsLocalStorageKey(pk)).toBe("");
  });

  it("should return an empty string when pk is undefined", () => {
    const pk: any = undefined;
    expect(getIntermediateDelegationsLocalStorageKey(pk)).toBe("");
  });
});
