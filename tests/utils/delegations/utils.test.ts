import { Transaction } from "bitcoinjs-lib";

import {
  clearTxSignatures,
  extractSchnorrSignaturesFromTransaction,
  uint8ArrayToHex,
} from "@/ui/common/utils/delegations";

// Mock bitcoinjs-lib
jest.mock("bitcoinjs-lib", () => {
  return {
    Transaction: jest.fn().mockImplementation(() => ({
      ins: [],
    })),
  };
});

describe("Transaction Utilities", () => {
  describe("clearTxSignatures", () => {
    it("should clear signatures from a transaction", () => {
      // Create a mock transaction with signatures
      const mockTx = {
        ins: [
          {
            script: Buffer.from("script1"),
            witness: [Buffer.from("witness1")],
          },
          {
            script: Buffer.from("script2"),
            witness: [Buffer.from("witness2")],
          },
        ],
      };

      const clearedTx = clearTxSignatures(mockTx as unknown as Transaction);

      // Check that all signatures are cleared
      expect(clearedTx.ins[0].script).toEqual(Buffer.alloc(0));
      expect(clearedTx.ins[0].witness).toEqual([]);
      expect(clearedTx.ins[1].script).toEqual(Buffer.alloc(0));
      expect(clearedTx.ins[1].witness).toEqual([]);
    });

    it("should handle transactions with no inputs", () => {
      const mockTx = { ins: [] };
      const clearedTx = clearTxSignatures(mockTx as unknown as Transaction);
      expect(clearedTx.ins).toEqual([]);
    });
  });

  describe("extractSchnorrSignaturesFromTransaction", () => {
    it("should extract the first valid Schnorr signature", () => {
      // Create a mock transaction with a valid Schnorr signature (64 bytes)
      const validSignature = Buffer.alloc(64, 1);
      const mockTx = {
        ins: [
          { witness: [validSignature, Buffer.from("other")] },
          { witness: [Buffer.from("other")] },
        ],
      };

      const signature = extractSchnorrSignaturesFromTransaction(
        mockTx as unknown as Transaction,
      );

      expect(signature).toBe(validSignature);
    });

    it("should return undefined when no valid signatures are found", () => {
      // Create a mock transaction with no valid Schnorr signatures
      const mockTx = {
        ins: [{ witness: [Buffer.from("invalid")] }, { witness: [] }],
      };

      const signature = extractSchnorrSignaturesFromTransaction(
        mockTx as unknown as Transaction,
      );

      expect(signature).toBeUndefined();
    });

    it("should handle transactions with no witness data", () => {
      const mockTx = {
        ins: [{}],
      };

      const signature = extractSchnorrSignaturesFromTransaction(
        mockTx as unknown as Transaction,
      );

      expect(signature).toBeUndefined();
    });
  });

  describe("uint8ArrayToHex", () => {
    it("should convert Uint8Array to hexadecimal string", () => {
      const uint8Array = new Uint8Array([0, 1, 10, 15, 255]);
      const hex = uint8ArrayToHex(uint8Array);

      expect(hex).toBe("00010a0fff");
    });

    it("should handle empty array", () => {
      const uint8Array = new Uint8Array([]);
      const hex = uint8ArrayToHex(uint8Array);

      expect(hex).toBe("");
    });

    it("should pad single digit hex values with leading zero", () => {
      const uint8Array = new Uint8Array([1, 2, 3]);
      const hex = uint8ArrayToHex(uint8Array);

      expect(hex).toBe("010203");
    });
  });
});
