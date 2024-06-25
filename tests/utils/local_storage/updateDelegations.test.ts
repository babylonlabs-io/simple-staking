import { Delegation } from "@/app/types/delegations";
import { filterDelegationsLocalStorage } from "@/utils/local_storage/filterDelegationsLocalStorage";
import { updateDelegations } from "@/utils/local_storage/updateDelegations";

// Mock the filterDelegationsLocalStorage function
jest.mock("@/utils/local_storage/filterDelegationsLocalStorage");

describe("updateDelegations", () => {
  const mockDelegationsHash1: Delegation[] = [
    { stakingTxHashHex: "hash1" } as Delegation,
  ];
  const mockDelegationsHash2: Delegation[] = [
    { stakingTxHashHex: "hash2" } as Delegation,
  ];

  beforeEach(() => {
    // Clear all instances and calls to constructor and all methods:
    jest.clearAllMocks();
  });

  it("should return new delegations if they are different from local storage", async () => {
    (filterDelegationsLocalStorage as jest.Mock).mockResolvedValue(
      mockDelegationsHash1,
    );

    const result = await updateDelegations(
      mockDelegationsHash1,
      mockDelegationsHash2,
    );

    expect(result.areDelegationsDifferent).toBe(true);
    expect(result.delegations).toEqual(mockDelegationsHash1);
  });

  it("should return original delegations if they are the same as local storage", async () => {
    (filterDelegationsLocalStorage as jest.Mock).mockResolvedValue(
      mockDelegationsHash2,
    );

    const result = await updateDelegations(
      mockDelegationsHash2,
      mockDelegationsHash2,
    );

    expect(result.areDelegationsDifferent).toBe(false);
    expect(result.delegations).toEqual(mockDelegationsHash2);
  });

  it("should handle empty API delegations correctly", async () => {
    (filterDelegationsLocalStorage as jest.Mock).mockResolvedValue([]);

    const result = await updateDelegations([], mockDelegationsHash2);

    expect(result.areDelegationsDifferent).toBe(true);
    expect(result.delegations).toEqual([]);
  });

  it("should handle empty local storage correctly", async () => {
    (filterDelegationsLocalStorage as jest.Mock).mockResolvedValue(
      mockDelegationsHash1,
    );

    const result = await updateDelegations(mockDelegationsHash1, []);

    expect(result.areDelegationsDifferent).toBe(true);
    expect(result.delegations).toEqual(mockDelegationsHash1);
  });

  it("should handle both empty delegations and local storage correctly", async () => {
    (filterDelegationsLocalStorage as jest.Mock).mockResolvedValue([]);

    const result = await updateDelegations([], []);

    expect(result.areDelegationsDifferent).toBe(false);
    expect(result.delegations).toEqual([]);
  });

  it("should handle identical delegations correctly", async () => {
    (filterDelegationsLocalStorage as jest.Mock).mockResolvedValue(
      mockDelegationsHash1,
    );

    const result = await updateDelegations(
      mockDelegationsHash1,
      mockDelegationsHash1,
    );

    expect(result.areDelegationsDifferent).toBe(false);
    expect(result.delegations).toEqual(mockDelegationsHash1);
  });
});
