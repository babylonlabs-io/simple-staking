import { UTXO } from "@babylonlabs-io/btc-staking-ts";
import { Transaction } from "bitcoinjs-lib";

import { BtcStakingInputs } from "@/ui/common/hooks/services/useTransactionService";
import {
  DelegationV2,
  DelegationV2StakingState,
} from "@/ui/common/types/delegationsV2";
import {
  validateDelegation,
  validateStakingInput,
} from "@/ui/common/utils/delegations";

// Mock Transaction.fromHex
jest.mock("bitcoinjs-lib", () => {
  const original = jest.requireActual("bitcoinjs-lib");
  return {
    ...original,
    Transaction: {
      ...original.Transaction,
      fromHex: jest.fn(),
    },
  };
});

describe("Transaction Validation", () => {
  describe("validateStakingInput", () => {
    it("should not throw an error for valid staking input", () => {
      const validInput: BtcStakingInputs = {
        finalityProviderPksNoCoordHex: [
          "0394f4c5563b66e6885d80c6b4735a73dad76e837b4e944ace49dd0ed9727ecc5a",
        ],
        stakingAmountSat: 100000,
        stakingTimelock: 1000,
      };

      expect(() => validateStakingInput(validInput)).not.toThrow();
    });

    it("should throw an error when finalityProviderPksNoCoordHex is missing", () => {
      const invalidInput: BtcStakingInputs = {
        finalityProviderPksNoCoordHex: [],
        stakingAmountSat: 100000,
        stakingTimelock: 1000,
      };

      expect(() => validateStakingInput(invalidInput)).toThrow(
        "Finality provider public keys (finalityProviderPksNoCoordHex) are required for staking input.",
      );
    });

    it("should throw an error when stakingAmountSat is missing", () => {
      const invalidInput: BtcStakingInputs = {
        finalityProviderPksNoCoordHex: [
          "0394f4c5563b66e6885d80c6b4735a73dad76e837b4e944ace49dd0ed9727ecc5a",
        ],
        stakingAmountSat: 0,
        stakingTimelock: 1000,
      };

      expect(() => validateStakingInput(invalidInput)).toThrow(
        "Staking amount (stakingAmountSat) is required for staking input.",
      );
    });

    it("should throw an error when stakingTimelock is missing", () => {
      const invalidInput: BtcStakingInputs = {
        finalityProviderPksNoCoordHex: [
          "0394f4c5563b66e6885d80c6b4735a73dad76e837b4e944ace49dd0ed9727ecc5a",
        ],
        stakingAmountSat: 100000,
        stakingTimelock: 0,
      };

      expect(() => validateStakingInput(invalidInput)).toThrow(
        "Staking timelock (stakingTimelock) is required for staking input.",
      );
    });
  });

  describe("validateDelegation", () => {
    const createMockDelegation = (
      state: DelegationV2StakingState,
      stakingTxHex: string,
    ): DelegationV2 => ({
      stakingAmount: 100000,
      stakingTxHashHex: "hash1",
      startHeight: 100,
      state,
      stakingTxHex,
      paramsVersion: 1,
      finalityProviderBtcPksHex: ["fp1"],
      stakerBtcPkHex: "staker1",
      stakingTimelock: 1000,
      bbnInceptionHeight: 100,
      bbnInceptionTime: "2023-01-01T00:00:00Z",
      endHeight: 1100,
      unbondingTimelock: 144,
      unbondingTxHex: "unbonding-tx-hex",
      slashing: {
        stakingSlashingTxHex: "slashing-tx-hex",
        unbondingSlashingTxHex: "unbonding-slashing-tx-hex",
        spendingHeight: 0,
      },
    });

    // Mock transaction with inputs that match available UTXOs
    const mockTx = {
      ins: [
        {
          hash: Buffer.from(
            "1111111111111111111111111111111111111111111111111111111111111111",
            "hex",
          ).reverse(),
          index: 0,
        },
        {
          hash: Buffer.from(
            "2222222222222222222222222222222222222222222222222222222222222222",
            "hex",
          ).reverse(),
          index: 1,
        },
      ],
    };

    // Mock UTXOs that match the transaction inputs
    const mockUTXOs: UTXO[] = [
      {
        txid: "1111111111111111111111111111111111111111111111111111111111111111",
        vout: 0,
        value: 10000,
        scriptPubKey: "mock-script",
      },
      {
        txid: "2222222222222222222222222222222222222222222222222222222222222222",
        vout: 1,
        value: 20000,
        scriptPubKey: "mock-script",
      },
    ];

    beforeEach(() => {
      jest.clearAllMocks();
      (Transaction.fromHex as jest.Mock).mockReturnValue(mockTx);
    });

    it("should validate VERIFIED delegations when inputs are available", () => {
      const delegation = createMockDelegation(
        DelegationV2StakingState.VERIFIED,
        "valid-tx-hex",
      );

      const result = validateDelegation(delegation, mockUTXOs);

      expect(Transaction.fromHex).toHaveBeenCalledWith("valid-tx-hex");
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("should invalidate VERIFIED delegations when inputs are not available", () => {
      const delegation = createMockDelegation(
        DelegationV2StakingState.VERIFIED,
        "invalid-tx-hex",
      );

      // Mock transaction with inputs that don't match available UTXOs
      const unavailableTx = {
        ins: [
          {
            hash: Buffer.from(
              "3333333333333333333333333333333333333333333333333333333333333333",
              "hex",
            ).reverse(),
            index: 0,
          },
        ],
      };

      (Transaction.fromHex as jest.Mock).mockReturnValue(unavailableTx);

      const result = validateDelegation(delegation, mockUTXOs);

      expect(Transaction.fromHex).toHaveBeenCalledWith("invalid-tx-hex");
      expect(result.valid).toBe(false);
      expect(result.error).toBe(
        "This stake is now invalid as the UTXO has already been used",
      );
    });

    it("should automatically validate non-VERIFIED delegations", () => {
      const nonVerifiedStates = [
        DelegationV2StakingState.ACTIVE,
        DelegationV2StakingState.PENDING,
        DelegationV2StakingState.TIMELOCK_UNBONDING,
        DelegationV2StakingState.EARLY_UNBONDING,
      ];

      for (const state of nonVerifiedStates) {
        const delegation = createMockDelegation(state, "any-tx-hex");
        const result = validateDelegation(delegation, mockUTXOs);

        expect(result.valid).toBe(true);
        expect(result.error).toBeUndefined();
      }

      // Transaction.fromHex should not be called for non-VERIFIED delegations
      expect(Transaction.fromHex).not.toHaveBeenCalled();
    });
  });
});
