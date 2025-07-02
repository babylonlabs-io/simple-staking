import { act, renderHook, waitFor } from "@testing-library/react";
import { useLocalStorage } from "usehooks-ts";

import { useDelegationStorage } from "@/ui/common/hooks/storage/useDelegationStorage";
import {
  DelegationV2,
  DelegationV2StakingState,
} from "@/ui/common/types/delegationsV2";

jest.mock("usehooks-ts", () => ({
  useLocalStorage: jest.fn(),
}));

describe("useDelegationStorage", () => {
  const mockKey = "test-key";
  const mockSetPendingDelegations = jest.fn();
  const mockSetDelegationStatuses = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useLocalStorage as jest.Mock).mockImplementation((key) => {
      if (key === `${mockKey}_pending`) {
        return [
          {},
          (setter: any) => {
            const newValue = typeof setter === "function" ? setter({}) : setter;
            mockSetPendingDelegations(newValue);
            return newValue;
          },
        ];
      }
      if (key === `${mockKey}_statuses`) {
        return [
          {},
          (setter: any) => {
            const newValue = typeof setter === "function" ? setter({}) : setter;
            mockSetDelegationStatuses(newValue);
            return newValue;
          },
        ];
      }
      return [{}, jest.fn()];
    });
  });

  const createMockDelegation = (
    hash: string,
    state: DelegationV2StakingState,
  ): DelegationV2 => ({
    stakingAmount: 100000000,
    stakingTxHashHex: hash,
    startHeight: 100,
    state,
    stakingTxHex: "0x123",
    paramsVersion: 1,
    finalityProviderBtcPksHex: ["0x456"],
    stakerBtcPkHex: "0x789",
    stakingTimelock: 1000,
    bbnInceptionHeight: 100,
    bbnInceptionTime: new Date().toISOString(),
    endHeight: 200,
    unbondingTimelock: 1000,
    unbondingTxHex: "0xabc",
    slashing: {
      stakingSlashingTxHex: "",
      unbondingSlashingTxHex: "",
      spendingHeight: 0,
    },
  });

  describe("initialization", () => {
    it("should initialize with empty state when no delegations provided", async () => {
      const { result } = renderHook(() => useDelegationStorage(mockKey));
      await waitFor(() => {
        expect(result.current.delegations).toEqual([]);
      });
    });

    it("should initialize with provided delegations", async () => {
      const mockDelegations = [
        createMockDelegation("hash1", DelegationV2StakingState.ACTIVE),
        createMockDelegation("hash2", DelegationV2StakingState.PENDING),
      ];

      const { result } = renderHook(() =>
        useDelegationStorage(mockKey, mockDelegations),
      );
      await waitFor(() => {
        expect(result.current.delegations).toHaveLength(2);
        expect(result.current.delegations[0].stakingTxHashHex).toBe("hash1");
        expect(result.current.delegations[1].stakingTxHashHex).toBe("hash2");
      });
    });
  });

  describe("addPendingDelegation", () => {
    it("should add a pending delegation with correct state", async () => {
      const { result } = renderHook(() => useDelegationStorage(mockKey));
      const mockDelegation = {
        stakingAmount: 100000000,
        stakingTxHashHex: "pending-hash",
        startHeight: 100,
        state: DelegationV2StakingState.PENDING,
      };

      act(() => {
        result.current.addPendingDelegation(mockDelegation);
      });

      await waitFor(() => {
        expect(mockSetPendingDelegations).toHaveBeenCalledWith({
          "pending-hash": {
            ...mockDelegation,
            state: DelegationV2StakingState.INTERMEDIATE_PENDING_VERIFICATION,
          },
        });
      });
    });

    it("should not add pending delegation when key is empty", async () => {
      const { result } = renderHook(() => useDelegationStorage(""));
      const mockDelegation = {
        stakingAmount: 100000000,
        stakingTxHashHex: "pending-hash",
        startHeight: 100,
        state: DelegationV2StakingState.PENDING,
      };

      act(() => {
        result.current.addPendingDelegation(mockDelegation);
      });

      await waitFor(() => {
        expect(mockSetPendingDelegations).not.toHaveBeenCalled();
      });
    });
  });

  describe("updateDelegationStatus", () => {
    it("should update delegation status", async () => {
      const { result } = renderHook(() => useDelegationStorage(mockKey));

      act(() => {
        result.current.updateDelegationStatus(
          "test-hash",
          DelegationV2StakingState.ACTIVE,
        );
      });

      await waitFor(() => {
        expect(mockSetDelegationStatuses).toHaveBeenCalledWith({
          "test-hash": DelegationV2StakingState.ACTIVE,
        });
      });
    });

    it("should not update status when key is empty", async () => {
      const { result } = renderHook(() => useDelegationStorage(""));

      act(() => {
        result.current.updateDelegationStatus(
          "test-hash",
          DelegationV2StakingState.ACTIVE,
        );
      });

      await waitFor(() => {
        expect(mockSetDelegationStatuses).not.toHaveBeenCalled();
      });
    });
  });

  describe("delegation synchronization", () => {
    it("should sync pending delegations when delegations change", async () => {
      const mockDelegations = [
        createMockDelegation("hash1", DelegationV2StakingState.ACTIVE),
      ];

      (useLocalStorage as jest.Mock).mockImplementation((key) => {
        if (key === `${mockKey}_pending`) {
          return [
            {
              "pending-hash": {
                stakingAmount: 100000000,
                stakingTxHashHex: "pending-hash",
                startHeight: 100,
                state: DelegationV2StakingState.PENDING,
              },
            },
            (setter: any) => {
              const newValue =
                typeof setter === "function" ? setter({}) : setter;
              mockSetPendingDelegations(newValue);
              return newValue;
            },
          ];
        }
        if (key === `${mockKey}_statuses`) {
          return [
            {},
            (setter: any) => {
              const newValue =
                typeof setter === "function" ? setter({}) : setter;
              mockSetDelegationStatuses(newValue);
              return newValue;
            },
          ];
        }
        return [{}, jest.fn()];
      });

      renderHook(() => useDelegationStorage(mockKey, mockDelegations));

      await waitFor(() => {
        expect(mockSetPendingDelegations).toHaveBeenCalledWith({});
      });
    });

    it("should sync delegation statuses when delegations change", async () => {
      const mockDelegations = [
        createMockDelegation("hash1", DelegationV2StakingState.ACTIVE),
      ];

      (useLocalStorage as jest.Mock).mockImplementation((key) => {
        if (key === `${mockKey}_pending`) {
          return [
            {},
            (setter: any) => {
              const newValue =
                typeof setter === "function" ? setter({}) : setter;
              mockSetPendingDelegations(newValue);
              return newValue;
            },
          ];
        }
        if (key === `${mockKey}_statuses`) {
          return [
            {
              hash1: DelegationV2StakingState.PENDING,
            },
            (setter: any) => {
              const newValue =
                typeof setter === "function" ? setter({}) : setter;
              mockSetDelegationStatuses(newValue);
              return newValue;
            },
          ];
        }
        return [{}, jest.fn()];
      });

      renderHook(() => useDelegationStorage(mockKey, mockDelegations));

      await waitFor(() => {
        expect(mockSetDelegationStatuses).toHaveBeenCalledWith({});
      });
    });
  });

  describe("formatted delegations", () => {
    it("should combine pending and active delegations", () => {
      const mockDelegations = [
        createMockDelegation("hash1", DelegationV2StakingState.ACTIVE),
      ];

      (useLocalStorage as jest.Mock).mockImplementation((key) => {
        if (key === `${mockKey}_pending`) {
          return [
            {
              "pending-hash": {
                stakingAmount: 100000000,
                stakingTxHashHex: "pending-hash",
                startHeight: 100,
                state: DelegationV2StakingState.PENDING,
              },
            },
            mockSetPendingDelegations,
          ];
        }
        if (key === `${mockKey}_statuses`) {
          return [{}, mockSetDelegationStatuses];
        }
        return [null, jest.fn()];
      });

      const { result } = renderHook(() =>
        useDelegationStorage(mockKey, mockDelegations),
      );

      expect(result.current.delegations).toHaveLength(2);
      expect(result.current.delegations[0].stakingTxHashHex).toBe(
        "pending-hash",
      );
      expect(result.current.delegations[1].stakingTxHashHex).toBe("hash1");
    });

    it("should apply delegation statuses correctly", () => {
      const mockDelegations = [
        createMockDelegation("hash1", DelegationV2StakingState.PENDING),
      ];

      (useLocalStorage as jest.Mock).mockImplementation((key) => {
        if (key === `${mockKey}_pending`) {
          return [{}, mockSetPendingDelegations];
        }
        if (key === `${mockKey}_statuses`) {
          return [
            {
              hash1: DelegationV2StakingState.ACTIVE,
            },
            mockSetDelegationStatuses,
          ];
        }
        return [null, jest.fn()];
      });

      const { result } = renderHook(() =>
        useDelegationStorage(mockKey, mockDelegations),
      );

      expect(result.current.delegations[0].state).toBe(
        DelegationV2StakingState.ACTIVE,
      );
    });
  });
});
