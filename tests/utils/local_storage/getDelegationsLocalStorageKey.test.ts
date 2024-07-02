import { getDelegationsLocalStorageKey } from "@/utils/local_storage/getDelegationsLocalStorageKey";

describe("utils/local_storage/getDelegationsLocalStorageKey", () => {
  it("should return the correct key when pk is provided", () => {
    const pk = "someRandomKey";
    const expectedKey = "bbn-staking-delegations-someRandomKey";
    expect(getDelegationsLocalStorageKey(pk)).toBe(expectedKey);
  });

  it("should return an empty string when pk is an empty string", () => {
    const pk = "";
    expect(getDelegationsLocalStorageKey(pk)).toBe("");
  });

  it("should return an empty string when pk is null", () => {
    const pk: any = null;
    expect(getDelegationsLocalStorageKey(pk)).toBe("");
  });

  it("should return an empty string when pk is undefined", () => {
    const pk: any = undefined;
    expect(getDelegationsLocalStorageKey(pk)).toBe("");
  });
});
