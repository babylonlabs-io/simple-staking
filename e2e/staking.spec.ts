import { expect, Page, test } from "@playwright/test";

import { getNetworkConfig } from "@/config/network.config";
import { getDelegationsLocalStorageKey } from "@/utils/local_storage/getDelegationsLocalStorageKey";
import { getPublicKeyNoCoord } from "@/utils/wallet";

import {
  STAKING_AMOUNT_BTC,
  STAKING_AMOUNT_SAT,
  STAKING_DURATION_BLOCKS,
} from "./constants/staking";
import { INPUT_DURATION_BLOCKS } from "./constants/text";
import { setupWalletConnection } from "./helper/connect";

type Network = "mainnet" | "signet";
type AddressType = "taproot" | "nativeSegwit";

// Determine the network from environment variable or default to 'mainnet'
const network: Network =
  (process.env.NEXT_PUBLIC_NETWORK as Network) || "mainnet";

// Define the address types to test
const addressTypes: AddressType[] = ["taproot", "nativeSegwit"];

// Reusable function to perform staking steps
async function performStaking(page: Page, coinName: string) {
  const previewButton = page.locator("button").filter({ hasText: "Preview" });

  // Select the first finality provider in the list
  await page.locator("#finality-providers > div > div").first().click();
  await expect(previewButton).toBeDisabled();

  // Optional depending on the API data: Fill the duration input if it exists
  const durationInput = page.getByPlaceholder(INPUT_DURATION_BLOCKS);

  // Use `count()` to check if the duration input exists
  if ((await durationInput.count()) > 0) {
    await durationInput.fill(`${STAKING_DURATION_BLOCKS}`);
  }

  // Fill the staking amount to enable the preview button
  await page.getByPlaceholder(coinName).fill(`${STAKING_AMOUNT_BTC}`);
  await expect(previewButton).toBeEnabled();

  // Click the preview button to proceed
  await previewButton.click();

  // Click the stake button to initiate staking
  const stakeButton = page.locator("button").filter({ hasText: "Stake" });
  await stakeButton.click();

  // Verify that the success modal appears
  const successModal = page
    .getByTestId("modal")
    .locator("div")
    .filter({ hasText: "Congratulations!" });
  await expect(successModal).toBeVisible();
}

test.describe("Create staking transaction", () => {
  // Iterate over each address type
  for (const type of addressTypes) {
    test.describe(`${type} address on ${network}`, () => {
      // Setup wallet connection before each test
      test.beforeEach(async ({ page }) => {
        await setupWalletConnection(page, network, type);
      });

      test(`should successfully create a staking transaction using ${type}`, async ({
        page,
      }) => {
        const { coinName } = getNetworkConfig();

        // Perform the staking steps
        await performStaking(page, coinName);

        // Retrieve the public key from the wallet
        const publicKeyHex = await page.evaluate(
          async () => await window.btcwallet.getPublicKeyHex(),
        );
        const publicKeyNoCoord =
          getPublicKeyNoCoord(publicKeyHex).toString("hex");

        // Verify the local storage has the correct staking details
        const item = await page.evaluate(
          (key: string) => localStorage.getItem(key),
          getDelegationsLocalStorageKey(publicKeyNoCoord),
        );
        expect(item).not.toBeNull();

        const parsed = JSON.parse(item as string);
        expect(parsed).toHaveLength(1);

        // Check that the staking amount matches expectations
        const [delegation] = parsed;
        expect(delegation.stakingValueSat).toBe(STAKING_AMOUNT_SAT);
      });
    });
  }
});
