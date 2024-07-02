import { Delegation } from "@/app/types/delegations";
import { calculateDelegationsDiff } from "@/utils/local_storage/calculateDelegationsDiff";
import { filterDelegationsLocalStorage } from "@/utils/local_storage/filterDelegationsLocalStorage";

// Mock the filterDelegationsLocalStorage function
jest.mock("@/utils/local_storage/filterDelegationsLocalStorage");

describe("utils/local_storage/calculateDelegationsDiff", () => {
  const mockDelegationsHash1: Delegation[] = [
    { stakingTxHashHex: "hash1" } as Delegation,
  ];
  const mockDelegationsHash2: Delegation[] = [
    { stakingTxHashHex: "hash2" } as Delegation,
  ];

  const mockDelegationsMultiple1: Delegation[] = [
    { stakingTxHashHex: "hash1" } as Delegation,
    { stakingTxHashHex: "hash3" } as Delegation,
    { stakingTxHashHex: "hash5" } as Delegation,
  ];

  const mockDelegationsMultiple2: Delegation[] = [
    { stakingTxHashHex: "hash2" } as Delegation,
    { stakingTxHashHex: "hash4" } as Delegation,
    { stakingTxHashHex: "hash6" } as Delegation,
  ];

  beforeEach(() => {
    // Clear all instances and calls to constructor and all methods:
    jest.clearAllMocks();
  });

  it("should return new delegations if they are different from local storage", async () => {
    (filterDelegationsLocalStorage as jest.Mock).mockResolvedValue(
      mockDelegationsHash1,
    );

    const result = await calculateDelegationsDiff(
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

    const result = await calculateDelegationsDiff(
      mockDelegationsHash2,
      mockDelegationsHash2,
    );

    expect(result.areDelegationsDifferent).toBe(false);
    expect(result.delegations).toEqual(mockDelegationsHash2);
  });

  it("should handle empty API delegations correctly", async () => {
    (filterDelegationsLocalStorage as jest.Mock).mockResolvedValue([]);

    const result = await calculateDelegationsDiff([], mockDelegationsHash2);

    expect(result.areDelegationsDifferent).toBe(true);
    expect(result.delegations).toEqual([]);
  });

  it("should handle empty local storage correctly", async () => {
    (filterDelegationsLocalStorage as jest.Mock).mockResolvedValue(
      mockDelegationsHash1,
    );

    const result = await calculateDelegationsDiff(mockDelegationsHash1, []);

    expect(result.areDelegationsDifferent).toBe(true);
    expect(result.delegations).toEqual(mockDelegationsHash1);
  });

  it("should handle both empty delegations and local storage correctly", async () => {
    (filterDelegationsLocalStorage as jest.Mock).mockResolvedValue([]);

    const result = await calculateDelegationsDiff([], []);

    expect(result.areDelegationsDifferent).toBe(false);
    expect(result.delegations).toEqual([]);
  });

  it("should handle multiple items in delegations and local storage correctly", async () => {
    (filterDelegationsLocalStorage as jest.Mock).mockResolvedValue(
      mockDelegationsMultiple1,
    );

    const result = await calculateDelegationsDiff(
      mockDelegationsMultiple1,
      mockDelegationsMultiple2,
    );

    expect(result.areDelegationsDifferent).toBe(true);
    expect(result.delegations).toEqual(mockDelegationsMultiple1);
  });

  it("should handle multiple items when delegations are the same", async () => {
    (filterDelegationsLocalStorage as jest.Mock).mockResolvedValue(
      mockDelegationsMultiple1,
    );

    const result = await calculateDelegationsDiff(
      mockDelegationsMultiple1,
      mockDelegationsMultiple1,
    );

    expect(result.areDelegationsDifferent).toBe(false);
    expect(result.delegations).toEqual(mockDelegationsMultiple1);
  });

  it("should handle case where filtered delegations are different", async () => {
    const filteredDelegations = [
      { stakingTxHashHex: "hash1" } as Delegation,
      { stakingTxHashHex: "hash2" } as Delegation,
    ];

    (filterDelegationsLocalStorage as jest.Mock).mockResolvedValue(
      filteredDelegations,
    );

    const result = await calculateDelegationsDiff(
      mockDelegationsMultiple1,
      mockDelegationsMultiple2,
    );

    expect(result.areDelegationsDifferent).toBe(true);
    expect(result.delegations).toEqual(filteredDelegations);
  });
});
