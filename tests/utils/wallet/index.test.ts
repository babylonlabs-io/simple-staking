import { networks } from "bitcoinjs-lib";

import {
  getPublicKeyNoCoord,
  isSupportedAddressType,
  isTaproot,
  toNetwork,
} from "@/utils/wallet";
import { Network } from "@/utils/wallet/wallet_provider";

import { testingNetworks } from "../../helper";

const nativeSegWitAddress = "tb1qpfctsp5vdsjfg657g8pruka5pp84ye4q9g6u3r";
const taprootAddress =
  "tb1p2wl2dglg0sqv4r8l7r4uc5av72hyty8zprelfa4kwxw9xhqkv55s3kz7ze";
const legacyAddress = "n2eq5iP3UsdfmGsJyEEMXyRGNx5ysUXLXb";
const nestedSegWitAddress = "2NChmRbq92M6geBmwCXcFF8dCfmGr38FmX2";

describe("toNetwork", () => {
  it("should return bitcoin network for MAINNET", () => {
    expect(toNetwork(Network.MAINNET)).toBe(networks.bitcoin);
  });

  it("should return testnet network for TESTNET", () => {
    expect(toNetwork(Network.TESTNET)).toBe(networks.testnet);
  });

  it("should return testnet network for SIGNET", () => {
    expect(toNetwork(Network.SIGNET)).toBe(networks.testnet);
  });

  it("should throw an error for unsupported network", () => {
    expect(() => toNetwork("unsupported" as Network)).toThrow(
      "Unsupported network",
    );
  });
});

describe("isSupportedAddressType", () => {
  it("should return true for native SegWit address length", () => {
    expect(isSupportedAddressType(nativeSegWitAddress)).toBe(true);
  });

  it("should return true for Taproot address length", () => {
    expect(isSupportedAddressType(taprootAddress)).toBe(true);
  });

  it("should return false for unsupported address length", () => {
    expect(isSupportedAddressType(legacyAddress)).toBe(false);
    expect(isSupportedAddressType(nestedSegWitAddress)).toBe(false);
    expect(isSupportedAddressType("a".repeat(40))).toBe(false);
  });
});

describe("isTaproot", () => {
  it("should return true for Taproot address length", () => {
    expect(isTaproot(taprootAddress)).toBe(true);
  });

  it("should return false for non-Taproot address length", () => {
    expect(isTaproot(nativeSegWitAddress)).toBe(false);
    expect(isTaproot(legacyAddress)).toBe(false);
    expect(isTaproot(nestedSegWitAddress)).toBe(false);
  });
});

describe("getPublicKeyNoCoord", () => {
  const keyPair = testingNetworks[0].dataGenerator.generateRandomKeyPair();
  it("should return the first 32 bytes of the public key without the first byte", () => {
    const expected = Buffer.from(keyPair.noCoordPublicKey, "hex");
    expect(getPublicKeyNoCoord(keyPair.publicKey)).toEqual(expected);
    expect(expected.length).toBe(32);
  });
});
