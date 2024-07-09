import { Delegation } from "@/app/types/delegations";
import { filterDelegationsLocalStorage } from "@/utils/local_storage/filterDelegationsLocalStorage";
import { getTxInfo } from "@/utils/mempool_api";

import { generateMockDelegation } from "../../helper/generateMockDelegation";

// Mock the getTxInfo function
jest.mock("@/utils/mempool_api");

describe("utils/local_storage/filterDelegationsLocalStorage", () => {
  const notExceedingLimitDelegations: Delegation[] = [
    generateMockDelegation("hash2", "staker2", "provider2", 2000, 23), // 23 hours ago
    generateMockDelegation("hash4", "staker4", "provider4", 4000, 0), // Current time
    generateMockDelegation("hash5", "staker5", "provider5", 5000, 22), // 22 hours ago
  ];

  const exceedingLimitDelegations: Delegation[] = [
    generateMockDelegation("hash1", "staker1", "provider1", 1000, 25), // 25 hours ago
    generateMockDelegation("hash3", "staker3", "provider3", 3000, 26), // 26 hours ago
    generateMockDelegation("hash6", "staker6", "provider6", 6000, 27), // 27 hours ago
  ];

  const mockDelegationsLocalStorage: Delegation[] = [
    ...notExceedingLimitDelegations,
    ...exceedingLimitDelegations,
  ];

  const mockDelegationsAPI: Delegation[] = [
    generateMockDelegation("hash7", "staker7", "provider7", 7000, 0),
    generateMockDelegation("hash8", "staker8", "provider8", 8000, 0),
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return valid delegations not present in the API and not exceeding the max duration", async () => {
    (getTxInfo as jest.Mock).mockRejectedValue(
      new Error("Transaction not found in the mempool"),
    );

    const result = await filterDelegationsLocalStorage(
      mockDelegationsLocalStorage,
      mockDelegationsAPI,
    );

    // Expect delegations not exceeding the max duration and not in the API to be returned
    expect(result).toEqual(notExceedingLimitDelegations);
  });

  it("should remove delegations that exceed max duration and are not in the mempool", async () => {
    (getTxInfo as jest.Mock).mockRejectedValue(
      new Error("Transaction not found in the mempool"),
    );

    const result = await filterDelegationsLocalStorage(
      mockDelegationsLocalStorage,
      mockDelegationsAPI,
    );

    // Expect delegations exceeding the max duration and not found in the mempool to be removed
    exceedingLimitDelegations.forEach((delegation) => {
      expect(result).not.toContain(delegation);
    });

    // Ensure remaining delegations are the ones not exceeding the limit
    expect(result).toEqual(notExceedingLimitDelegations);
  });

  it("should keep delegations that exceed max duration but are found in the mempool", async () => {
    (getTxInfo as jest.Mock).mockImplementation((txHash) => {
      if (txHash === "hash1" || txHash === "hash3" || txHash === "hash6") {
        return Promise.resolve({});
      } else {
        return Promise.reject(
          new Error("Transaction not found in the mempool"),
        );
      }
    });

    const result = await filterDelegationsLocalStorage(
      mockDelegationsLocalStorage,
      mockDelegationsAPI,
    );

    // Sort both arrays to avoid issues with order
    const sortedResult = result.sort((a, b) =>
      a.stakingTxHashHex.localeCompare(b.stakingTxHashHex),
    );
    const expectedSortedResult = [
      ...exceedingLimitDelegations,
      ...notExceedingLimitDelegations,
    ].sort((a, b) => a.stakingTxHashHex.localeCompare(b.stakingTxHashHex));

    // Expect delegations exceeding the max duration but found in the mempool to be kept
    expect(sortedResult).toEqual(expectedSortedResult);
  });

  it("should keep delegations that are within the max duration", async () => {
    const recentDelegation: Delegation = generateMockDelegation(
      "hash9",
      "staker9",
      "provider9",
      9000,
      0,
    );

    const delegationsLocalStorage = [recentDelegation];
    const result = await filterDelegationsLocalStorage(
      delegationsLocalStorage,
      mockDelegationsAPI,
    );
    expect(result).toEqual([recentDelegation]);
  });

  it("should handle local storage delegations exactly on the max duration boundary", async () => {
    const boundaryDelegation: Delegation = generateMockDelegation(
      "hash10",
      "staker10",
      "provider10",
      10000,
      24,
    );

    const delegationsLocalStorage = [boundaryDelegation];
    const result = await filterDelegationsLocalStorage(
      delegationsLocalStorage,
      mockDelegationsAPI,
    );

    expect(result).toEqual([boundaryDelegation]);
  });

  it("should handle no API data but local storage items are present", async () => {
    (getTxInfo as jest.Mock).mockRejectedValue(
      new Error("Transaction not found in the mempool"),
    );

    const result = await filterDelegationsLocalStorage(
      mockDelegationsLocalStorage,
      [],
    );

    // Expect only delegations not exceeding the max duration to be returned
    expect(result).toEqual(notExceedingLimitDelegations);
  });

  it("should handle API data present but no local storage items", async () => {
    const result = await filterDelegationsLocalStorage([], mockDelegationsAPI);

    // Expect result to be empty as there are no local storage items to filter
    expect(result).toEqual([]);
  });

  it("should handle no API data and no local storage items", async () => {
    const result = await filterDelegationsLocalStorage([], []);
    expect(result).toEqual([]);
  });
});
