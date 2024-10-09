import { expect, Page, test } from "@playwright/test";

import { satoshiToBtc } from "@/utils/btcConversions";
import { maxDecimals } from "@/utils/maxDecimals";
import { trim } from "@/utils/trim";

import {
  NATIVE_SEGWIT_MAINNET_ADDRESS,
  NATIVE_SEGWIT_SIGNET_ADDRESS,
  TAPROOT_MAINNET_ADDRESS,
  TAPROOT_SIGNET_ADDRESS,
} from "./constants/wallet";
import { setupWalletConnection } from "./helper/connect";
import { mockNetwork } from "./helper/mockNetwork";
import { extractNumericBalance } from "./helper/utils";
import { nativeSegwitMainnetBalance } from "./mock/mainnet/wallet/nativeSegwit/utxos";
import { taprootMainnetBalance } from "./mock/mainnet/wallet/taproot/utxos";
import { nativeSegwitSignetBalance } from "./mock/signet/wallet/nativeSegwit/utxos";
import { taprootSignetBalance } from "./mock/signet/wallet/taproot/utxos";

type Network = "mainnet" | "signet";
type AddressType = "taproot" | "nativeSegwit";

// Determine the network from environment variable or default to 'mainnet'
const network: Network =
  (process.env.NEXT_PUBLIC_NETWORK as Network) || "mainnet";

// Define the address types to test
const addressTypes: AddressType[] = ["taproot", "nativeSegwit"];

// Mappings for expected addresses based on network and address type
const expectedAddresses: Record<AddressType, Record<Network, string>> = {
  taproot: {
    mainnet: TAPROOT_MAINNET_ADDRESS,
    signet: TAPROOT_SIGNET_ADDRESS,
  },
  nativeSegwit: {
    mainnet: NATIVE_SEGWIT_MAINNET_ADDRESS,
    signet: NATIVE_SEGWIT_SIGNET_ADDRESS,
  },
};

// Mappings for expected balances based on network and address type
const expectedBalances: Record<AddressType, Record<Network, number>> = {
  taproot: {
    mainnet: taprootMainnetBalance,
    signet: taprootSignetBalance,
  },
  nativeSegwit: {
    mainnet: nativeSegwitMainnetBalance,
    signet: nativeSegwitSignetBalance,
  },
};

// Reusable function for checking address
async function checkAddress(page: Page, expectedAddress: string) {
  const address = await page.getByTestId("address").textContent();
  expect(address).toBe(trim(expectedAddress));
}

// Reusable function for checking balance
async function checkBalance(page: Page, expectedBalance: number) {
  const balanceText = await page.getByTestId("balance").textContent();
  const balance = maxDecimals(extractNumericBalance(balanceText), 8);
  expect(balance).toBe(satoshiToBtc(expectedBalance));
}

test.describe("Balance and address checks after connection", () => {
  // Iterate over each address type
  for (const type of addressTypes) {
    test.describe(`${type} address on ${network}`, () => {
      // Mock the network
      test.beforeEach(async ({ page }) => {
        await mockNetwork(page, network);
      });

      // Setup wallet connection before each test
      test.beforeEach(async ({ page }) => {
        await setupWalletConnection(page, network, type);
      });

      test(`should verify the ${type} address and balance on ${network}`, async ({
        page,
      }) => {
        const expectedAddress = expectedAddresses[type][network];
        const expectedBalance = expectedBalances[type][network];

        // Perform address check
        await checkAddress(page, expectedAddress);

        // Perform balance check
        await checkBalance(page, expectedBalance);
      });
    });
  }
});
